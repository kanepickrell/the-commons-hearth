// Runtime smoke test: mount the whole app at a few routes with Supabase
// stubbed and make sure nothing throws during render. Catches the class of
// bug where a page crashes on data it doesn't expect (e.g. a craft slug with
// no artwork) before it reaches a browser.
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';

vi.stubEnv('VITE_SUPABASE_URL', 'https://example.supabase.co');
vi.stubEnv('VITE_SUPABASE_PUBLISHABLE_KEY', 'sb_publishable_test');

// A chainable query builder that resolves to canned rows per relation.
const rows: Record<string, unknown[]> = {};
function builder(table: string) {
  const result = { data: rows[table] ?? [], error: null };
  const b: Record<string, unknown> = {};
  const chain = () => b;
  for (const m of ['select', 'eq', 'in', 'gte', 'lte', 'lt', 'gt', 'not', 'order', 'limit', 'insert', 'update', 'delete']) {
    b[m] = chain;
  }
  b.maybeSingle = () => Promise.resolve({ data: (rows[table] ?? [])[0] ?? null, error: null });
  b.then = (res: (v: unknown) => unknown) => Promise.resolve(result).then(res);
  return b;
}

vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: (t: string) => builder(t),
    rpc: () => Promise.resolve({ data: 0, error: null }),
    auth: {
      getSession: () => Promise.resolve({ data: { session: null } }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe() {} } } }),
    },
    storage: { from: () => ({ getPublicUrl: () => ({ data: { publicUrl: '' } }) }) },
  },
}));

// Leaflet needs a real layout engine; swap the map for a placeholder.
vi.mock('@/components/ParishMap', () => ({ ParishMap: () => <div data-testid="map" /> }));

import App from '@/App';

const visit = (path: string) => {
  window.history.pushState({}, '', path);
  return render(<App />);
};

beforeEach(() => {
  for (const k of Object.keys(rows)) delete rows[k];
  window.localStorage.clear();
});

describe('app renders', () => {
  it('home with a witness post whose craft has no artwork', async () => {
    rows.witness_public = [{
      id: '1', body: 'We split a hive.', language: 'en', craft: 'el-huerto',
      occurred_at: '2026-04-12T00:00:00Z', author_display_name: 'M. Cruz',
    }];
    visit('/');
    await waitFor(() => expect(screen.getByText(/We split a hive/)).toBeInTheDocument());
    expect(screen.getByText(/M\. Cruz/)).toBeInTheDocument();
  });

  it('workshops list, including a non-illustrated craft', async () => {
    rows.gatherings_public = [{
      id: 'w1', title: 'Soil testing', description: null, language: 'en', craft: 'la-mano',
      event_date: '2099-01-01', held_at: null, location_text: null, host_name: 'K', details_visible: false,
    }];
    visit('/workshops');
    await waitFor(() => expect(screen.getByText('Soil testing')).toBeInTheDocument());
    expect(screen.getByText(/location & time shown to members/)).toBeInTheDocument();
  });

  it('witness page with the year wheel', async () => {
    visit('/witness');
    await waitFor(() => expect(screen.getByText(/No witness posts yet/)).toBeInTheDocument());
  });

  it('witness year figures carry their human evidence', async () => {
    // Sourced from gatherings, not witness posts: the chapter records
    // gatherings continuously and has written no witness posts at all, so
    // witness-sourced evidence would render empty forever.
    rows.gatherings_public = [
      { craft: 'las-abejas', host_name: 'Ana M.', event_date: '2026-04-12' },
      { craft: 'el-pan', host_name: 'Thomas R.', event_date: '2026-05-02' },
      // Repeat host and craft — both lists must de-duplicate.
      { craft: 'el-pan', host_name: 'Ana M.', event_date: '2026-06-02' },
    ];
    rows.month_metrics = [
      { month: 3, gatherings: 2, neighbors: 11, hosts: 1 },
      { month: 4, gatherings: 1, neighbors: 7, hosts: 2 },
    ];
    // Two parishes have members; the empty one must not be counted.
    rows.parish_member_counts = [
      { parish_id: 'p1', member_count: 5 },
      { parish_id: 'p2', member_count: 2 },
      { parish_id: 'p3', member_count: 0 },
    ];

    visit('/witness');

    // The hosts figure resolves to the people behind it, hedged as "including"
    // because the total is steward-entered and runs ahead of the gatherings.
    await waitFor(() => expect(screen.getByText(/including/)).toBeInTheDocument());
    expect(screen.getByText(/Ana M\./)).toBeInTheDocument();
    // The neighbours figure resolves to how far the households are spread.
    expect(screen.getByText('in 2 parishes')).toBeInTheDocument();
    // And the gatherings figure to what was actually made.
    expect(screen.getAllByRole('img', { name: /bee/i }).length).toBeGreaterThan(0);
  });

  it('witness wheel refuses months that have not happened yet', async () => {
    rows.month_metrics = [{ month: 0, gatherings: 1, neighbors: 4, hosts: 1 }];
    visit('/witness');

    await waitFor(() => expect(screen.getByLabelText('January 2026')).toBeInTheDocument());

    const now = new Date();
    const thisMonth = now.getFullYear() === 2026 ? now.getMonth() : 11;
    // Every month up to the present is a real control...
    expect(screen.getByLabelText(`January 2026`)).toHaveAttribute('role', 'button');
    // ...and December of a year still in progress is not.
    if (thisMonth < 11) {
      const future = screen.getByLabelText('December 2026');
      expect(future).toHaveAttribute('aria-disabled', 'true');
      expect(future).not.toHaveAttribute('role', 'button');
    }
  });

  it('member page for a signed-out visitor', async () => {
    rows.profiles = [{ id: 'p1', display_name: 'Thomas', bio: 'Bees.', working_on: null,
      wants_to_learn: null, bio_language: 'en', icon_slug: 'el-rebano', parish: null }];
    rows.expertise = [{ id: 'e1', craft: 'el-huerto' }];
    visit('/members/p1');
    await waitFor(() => expect(screen.getByText('Thomas')).toBeInTheDocument());
    expect(screen.getByText('Vegetable garden')).toBeInTheDocument();
  });

  it('language toggle rewrites the URL through the router', async () => {
    visit('/workshops');
    await waitFor(() => screen.getByLabelText('Español'));
    screen.getByLabelText('Español').click();
    await waitFor(() => expect(window.location.pathname).toBe('/talleres'));
    expect(document.documentElement.lang).toBe('es');
  });

  it('unknown route shows not-found', async () => {
    visit('/nope');
    await waitFor(() => expect(screen.getByText(/404/)).toBeInTheDocument());
  });
});
