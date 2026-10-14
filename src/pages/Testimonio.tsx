// src/pages/Testimonio.tsx
// The Testimonio page — the public "evidence of communion" view.
// Reads approved witness posts from the DB, groups by month, renders the year wheel.
// Empty wheel is the honest state before the chapter starts posting.
//
// The page reads as three movements, widest to narrowest, so a visitor who
// scrolls once gets the whole argument:
//
//   THE YEAR     one ledger line — gatherings, hosts, neighbours across 2026
//   THE MONTH    the wheel, and the selected month beside it
//   THE MOMENTS  that month's recaps and photographs, full width
//
// Both the year band and the month column carry the same three words
// (gatherings / hosts / neighbours), so each is explicitly scope-labelled —
// "THE YEAR SO FAR" against "IN OCTOBER". Without that they read as a
// contradiction rather than a zoom.

import { useEffect, useMemo, useState } from 'react';
import { Layout } from '@/components/Layout';
import { useLocale } from '@/i18n/LocaleProvider';
import { uiStrings } from '@/lib/fixtures/uiStrings';
import { YearWheel, SeasonKey } from '@/components/testimonio/YearWheel';
import { MonthPanel } from '@/components/testimonio/MonthPanel';
import { supabase } from '@/lib/supabase';
import type { WitnessPost, IconSlug, Bilingual } from '@/lib/types';
import { MonthDetail } from '@/components/testimonio/MonthDetail';
import { chapterToday } from '@/lib/dates';

// What comes back from the `witness_public` view — approved posts only, flat
// columns, single-language body, plus the author's display name.
type WitnessRow = {
  id: string;
  author_id: string | null;
  author_display_name: string | null;
  workshop_id: string | null;
  craft: IconSlug | null;
  body: string;
  language: 'en' | 'es' | null;
  fruit_count: number | null;
  fruit_unit: string | null;
  occurred_at: string;
};

// The year the wheel represents. The wheel, the hub and the month totals all
// read from this one constant; switch to chapterToday().getFullYear() when the
// chapter is ready for the page to roll over on its own.
const WHEEL_YEAR = 2026;

// Convert a DB row into the shape the wheel/panel components already expect.
// The components take Bilingual strings; we supply the same string for both
// locales (rendering will show it verbatim) and rely on LanguageNote elsewhere
// for the "written in X" attribution.
const adaptRow = (r: WitnessRow): WitnessPost => {
  const bodyBi: Bilingual = { en: r.body, es: r.body };
  const unitBi: Bilingual = {
    en: r.fruit_unit ?? '',
    es: r.fruit_unit ?? '',
  };
  return {
    id: r.id,
    workshopId: r.workshop_id ?? '',
    hostId: r.author_id ?? '',
    hostName: r.author_display_name,
    date: r.occurred_at,
    body: bodyBi,
    iconSlug: r.craft ?? 'el-pan',
    fruit: {
      count: r.fruit_count ?? 0,
      unit: unitBi,
    },
  };
};

const Testimonio = () => {
  const { t, locale } = useLocale();
  const s = uiStrings.witness;

  // Today in CHAPTER time, not the viewer's — the same convention the rest of
  // the site uses for gathering times.
  const today = useMemo(() => chapterToday(), []);

  const [posts, setPosts] = useState<WitnessPost[]>([]);
  const [loading, setLoading] = useState(true);
  // Open on the current month when the wheel is showing the live year;
  // otherwise start the year at its beginning.
  const [selectedMonth, setSelectedMonth] = useState<number>(() =>
    today.getFullYear() === WHEEL_YEAR ? today.getMonth() : 0
  );

  // Headline chapter metrics — sourced from the live tables, not from witness
  // posts: gatherings + hosts from approved gatherings, neighbors from the
  // approved member roster, replicated from witness posts that cite a source.
  const [neighbors, setNeighbors] = useState(0);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from('witness_public')
        .select(
          'id, author_id, author_display_name, workshop_id, craft, body, language, fruit_count, fruit_unit, occurred_at'
        )
        .order('occurred_at', { ascending: false });

      if (error) {
        console.error('Failed to load witness posts:', error);
      } else if (data) {
        setPosts((data as unknown as WitnessRow[]).map(adaptRow));
      }
      setLoading(false);
    })();
  }, []);

  // Neighbors = the approved member roster count (parish or not). Gatherings
  // and hosts totals come from the manual monthly numbers (see yearTotals).
  useEffect(() => {
    (async () => {
      const { data, error } = await supabase.rpc('approved_member_count');
      if (error) {
        console.error('metrics: neighbors', error);
        return;
      }
      setNeighbors((data as number) ?? 0);
    })();
  }, []);

  // Only this year's posts belong on this year's wheel; a 2025 post would
  // otherwise land in its month slot as if it happened in 2026.
  const postsByMonth = useMemo(() => {
    const map: Record<number, WitnessPost[]> = {};
    for (const p of posts) {
      const d = new Date(p.date);
      if (d.getFullYear() !== WHEEL_YEAR) continue;
      (map[d.getMonth()] ||= []).push(p);
    }
    return map;
  }, [posts]);

  const monthPosts = postsByMonth[selectedMonth] || [];

  // Manual per-month totals (month_metrics) for the wheel tiles, keyed by month.
  const [monthTotals, setMonthTotals] = useState<Record<number, { gatherings: number; neighbors: number; hosts: number }>>({});
  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from('month_metrics')
        .select('month, gatherings, neighbors, hosts')
        .eq('year', WHEEL_YEAR);
      if (error) {
        console.error('Failed to load month totals:', error);
        return;
      }
      const map: Record<number, { gatherings: number; neighbors: number; hosts: number }> = {};
      for (const r of (data ?? []) as Array<{ month: number; gatherings: number; neighbors: number; hosts: number }>) {
        map[r.month] = { gatherings: r.gatherings, neighbors: r.neighbors, hosts: r.hosts };
      }
      setMonthTotals(map);
    })();
  }, []);

  // Overall Gatherings/Hosts on the headline row = the sum of the manual
  // monthly totals across the year.
  const yearTotals = useMemo(() => {
    let gatherings = 0;
    let hosts = 0;
    for (const m of Object.values(monthTotals)) {
      gatherings += m.gatherings;
      hosts += m.hosts;
    }
    return { gatherings, hosts };
  }, [monthTotals]);

  // Months the chapter actually met in — a recorded gathering counts even with
  // no witness post written yet. The wheel tints these so the year visibly
  // fills in.
  const activeMonths = useMemo(() => {
    const set = new Set<number>();
    for (const [m, totals] of Object.entries(monthTotals)) {
      if (totals.gatherings > 0) set.add(Number(m));
    }
    return set;
  }, [monthTotals]);

  return (
    <Layout>
      <section className="container-wide pb-24 pt-16 md:pt-20">
        {/* ---------------------------------------------------------------- */}
        {/* Masthead                                                         */}
        {/* ---------------------------------------------------------------- */}
        <header className="mx-auto max-w-2xl text-center">
          <p className="display-caps text-[11px] tracking-[0.3em] text-ocre">
            {t(s.eyebrow)}
          </p>
          <h1 className="mt-3 font-heading text-[32px] leading-[1.15] text-mesquite md:text-[42px]">
            {t(s.heading)}
          </h1>
          <p className="prose-body mt-4 text-base italic leading-relaxed text-piedra">
            {t(s.subhead)}
          </p>
        </header>

        {loading ? (
          <p className="mt-16 text-center font-serif italic text-piedra/60">…</p>
        ) : (
          <>
            {/* -------------------------------------------------------------- */}
            {/* I. The year — one ledger line                                  */}
            {/* -------------------------------------------------------------- */}
            <div className="mx-auto mt-14 max-w-2xl">
              <p className="mb-3 text-center font-caps text-[9px] tracking-[0.25em] text-piedra/70">
                {t(s.yearSoFar)}
              </p>
              <dl className="grid grid-cols-3 border-y border-mesquite/15">
                <YearStat n={yearTotals.gatherings} label={t(s.statGatherings)} />
                <YearStat n={yearTotals.hosts} label={t(s.statHosts)} divided />
                <YearStat n={neighbors} label={t(s.statNeighbors)} divided />
              </dl>
            </div>

            {/* -------------------------------------------------------------- */}
            {/* II. The month — the wheel, and the month beside it             */}
            {/* -------------------------------------------------------------- */}
            <div className="mx-auto mt-16 grid max-w-4xl grid-cols-1 items-start gap-10 md:mt-20 md:grid-cols-[380px_1fr] md:gap-12">
              <div>
                <YearWheel
                  posts={posts}
                  year={WHEEL_YEAR}
                  selectedMonth={selectedMonth}
                  onSelectMonth={setSelectedMonth}
                  locale={locale}
                  activeMonths={activeMonths}
                  today={today}
                />
                <SeasonKey year={WHEEL_YEAR} locale={locale} />
                {/* The instruction lives with the thing it describes, not up in
                    the masthead where it was competing with the headline. */}
                <p className="mt-4 text-center font-serif text-xs italic leading-relaxed text-piedra/80">
                  {t(s.pickMonth)}
                </p>
              </div>
              <div>
                <MonthPanel
                  year={WHEEL_YEAR}
                  month={selectedMonth}
                  posts={monthPosts}
                  locale={locale}
                  override={monthTotals[selectedMonth] ?? null}
                  onAskAboutPost={() => {}}
                  onAskMetric={() => {}}
                />
              </div>
            </div>

            {/* -------------------------------------------------------------- */}
            {/* III. The moments — recaps + photographs, full width            */}
            {/* -------------------------------------------------------------- */}
            <MonthDetail year={WHEEL_YEAR} month={selectedMonth} locale={locale} />

            {posts.length === 0 && yearTotals.gatherings === 0 && (
              <p className="mx-auto mt-12 max-w-md text-center font-serif italic text-piedra">
                {locale === 'es'
                  ? 'Aún no hay testimonios escritos. La rueda se llenará con el tiempo.'
                  : 'No witness posts yet. The wheel will fill as the year unfolds.'}
              </p>
            )}
          </>
        )}
      </section>
    </Layout>
  );
};

/**
 * One figure in the year ledger. Horizontal and rule-bounded, where the month
 * column's figures are a vertical stack — the different axis is what keeps the
 * two blocks from reading as the same table twice.
 */
const YearStat = ({
  n,
  label,
  divided = false,
}: {
  n: number;
  label: string;
  divided?: boolean;
}) => (
  <div className={`px-3 py-4 text-center ${divided ? 'border-l border-mesquite/12' : ''}`}>
    <dd className="font-heading text-[30px] leading-none text-mesquite tabular-nums md:text-[36px]">
      {n}
    </dd>
    <dt className="mt-2 font-caps text-[9px] tracking-[0.18em] text-ocre">
      {label.toUpperCase()}
    </dt>
  </div>
);

export default Testimonio;
