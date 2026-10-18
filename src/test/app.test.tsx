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
// Writes the app makes, so a test can assert what actually reached the DB.
const writes: { table: string; op: string; payload: unknown }[] = [];
function builder(table: string) {
  const result = { data: rows[table] ?? [], error: null };
  const b: Record<string, unknown> = {};
  const chain = () => b;
  for (const m of ['select', 'eq', 'in', 'gte', 'lte', 'lt', 'gt', 'not', 'order', 'limit', 'delete']) {
    b[m] = chain;
  }
  for (const m of ['insert', 'update']) {
    b[m] = (payload: unknown) => {
      writes.push({ table, op: m, payload });
      return b;
    };
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
  writes.length = 0;
  window.localStorage.clear();
});

describe('app renders', () => {
  it('home shows the next gathering, including a craft with no artwork', async () => {
    rows.gatherings_public = [{
      id: 'w1', title: 'Grafting rootstock', description: 'Bring a knife.',
      language: 'en', craft: 'el-huerto', event_date: '2099-03-04', held_at: null,
      location_text: null, parish_city: 'Lockhart', details_visible: false,
    }];
    visit('/');
    await waitFor(() => expect(screen.getByText('Grafting rootstock')).toBeInTheDocument());
    // The town, not the address: gatherings_public withholds location_text on
    // an upcoming gathering from anyone who isn't an approved member.
    expect(screen.getByText(/near Lockhart/)).toBeInTheDocument();
    expect(screen.getByText(/Log In To RSVP/)).toBeInTheDocument();
  });

  it('home says so plainly when nothing is scheduled', async () => {
    visit('/');
    await waitFor(() =>
      expect(screen.getByText(/No gathering scheduled yet/)).toBeInTheDocument()
    );
    expect(screen.getByText('join the chapter')).toBeInTheDocument();
  });

  it('home carries the mission', async () => {
    visit('/');
    await waitFor(() => expect(screen.getByText(/We Are the Catholic Land Movement/)).toBeInTheDocument());
    expect(screen.getByText('Resettlement')).toBeInTheDocument();
    expect(screen.getByText('Glorification')).toBeInTheDocument();
  });

  // The recognition is provenance, not a section heading — it belongs to the
  // footer, which is also what puts it on every page instead of just this one.
  it('the papal recognition rides in the footer, on every page', async () => {
    visit('/');
    const onHome = await waitFor(() => screen.getByText(/Recognized and blessed by Pope Leo XIV/));
    expect(onHome.closest('footer')).not.toBeNull();
    // ...and it is not left behind in the map section it used to sit in.
    expect(screen.getByText('MEET YOUR NEIGHBORS').parentElement?.textContent)
      .not.toMatch(/Pope Leo XIV/);

  });

  // Its own test, not a second visit() in the one above: visit() renders a
  // fresh app without unmounting the previous one, so counting matches across
  // two visits counts both copies of the site.
  it('vision carries the recognition in the page as well as the footer', async () => {
    visit('/vision');
    const all = await waitFor(() => {
      const found = screen.getAllByText(/Recognized and blessed by Pope Leo XIV/);
      expect(found).toHaveLength(2);
      return found;
    });
    // One standing behind the pillars the page lays out, one in the footer.
    expect(all.filter((el) => el.closest('footer') === null)).toHaveLength(1);
    expect(all.filter((el) => el.closest('footer') !== null)).toHaveLength(1);
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

  // The phone nav is a media-query layout, and jsdom has no layout — so this
  // tests the part that is actually logic: the panel's existence, the button's
  // state, and that following a link puts it away again.
  it('phone nav opens and closes behind the menu button', async () => {
    visit('/');
    const button = await waitFor(() => screen.getByLabelText('Menu'));
    expect(button).toHaveAttribute('aria-expanded', 'false');
    expect(document.getElementById('site-menu')).toBeNull();

    button.click();
    await waitFor(() => expect(document.getElementById('site-menu')).not.toBeNull());
    expect(screen.getByLabelText('Close menu')).toHaveAttribute('aria-expanded', 'true');

    // Every nav destination is reachable from inside the panel.
    const panel = document.getElementById('site-menu')!;
    const hrefs = [...panel.querySelectorAll('a')].map((a) => a.getAttribute('href'));
    expect(hrefs).toEqual(['/vision', '/participate', '/workshops', '/witness', '/patron', '/resources']);

    // Following one navigates and puts the panel away.
    (panel.querySelector('a[href="/vision"]') as HTMLAnchorElement).click();
    await waitFor(() => expect(window.location.pathname).toBe('/vision'));
    await waitFor(() => expect(document.getElementById('site-menu')).toBeNull());
  });

  it('the phone nav carries the language toggle', async () => {
    visit('/workshops');
    (await waitFor(() => screen.getByLabelText('Menu'))).click();
    // waitFor only retries when its callback THROWS, so assert inside it —
    // returning a bare null resolves on the first tick.
    const panel = await waitFor(() => {
      const el = document.getElementById('site-menu');
      expect(el).not.toBeNull();
      return el!;
    });

    const es = [...panel.querySelectorAll('button')].find((b) => b.textContent === 'ES')!;
    expect(es).toHaveAttribute('aria-pressed', 'false');
    es.click();
    await waitFor(() => expect(window.location.pathname).toBe('/talleres'));
    expect(document.documentElement.lang).toBe('es');
  });

  it('unknown route shows not-found', async () => {
    visit('/nope');
    await waitFor(() => expect(screen.getByText(/404/)).toBeInTheDocument());
  });
});
