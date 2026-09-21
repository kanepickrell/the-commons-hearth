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
  for (const m of ['select', 'eq', 'in', 'gte', 'lt', 'gt', 'not', 'order', 'limit', 'insert', 'update', 'delete']) {
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
