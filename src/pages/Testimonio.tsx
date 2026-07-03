// src/pages/Testimonio.tsx
// The Testimonio page — the public "evidence of communion" view.
// Reads approved witness posts from the DB, groups by month, renders the year wheel.
// Empty wheel is the honest state before the chapter starts posting.

import { useEffect, useMemo, useState } from 'react';
import { Layout } from '@/components/Layout';
import { useLocale } from '@/i18n/LocaleProvider';
import { uiStrings } from '@/lib/fixtures/uiStrings';
import { YearWheel } from '@/components/testimonio/YearWheel';
import { MonthPanel } from '@/components/testimonio/MonthPanel';
import { supabase } from '@/lib/supabase';
import type { WitnessPost, IconSlug, Bilingual } from '@/lib/types';
import { MonthCarousel } from '@/components/testimonio/MonthCarousel';
import { MonthSummaries } from '@/components/testimonio/MonthSummaries';

// What comes back from the DB — flat columns, single-language body.
type WitnessRow = {
  id: string;
  author_id: string;
  workshop_id: string | null;
  replicated_from_post_id: string | null;
  craft: IconSlug | null;
  body: string;
  language: 'en' | 'es' | null;
  fruit_count: number | null;
  fruit_unit: string | null;
  occurred_at: string;
};

// near the top of the file, above the component — the year the wheel represents.
// The wheel hardcodes 2026 in its hub, so the carousel matches it. Switch to
// new Date().getFullYear() if you'd rather it track the live year.
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
    hostId: r.author_id,
    date: r.occurred_at,
    body: bodyBi,
    iconSlug: (r.craft ?? 'el-pan') as IconSlug,
    fruit: {
      count: r.fruit_count ?? 0,
      unit: unitBi,
    },
  };
};

const Testimonio = () => {
  const { t, locale } = useLocale();
  const s = uiStrings.witness;

  const [posts, setPosts] = useState<WitnessPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState<number>(() => new Date().getMonth());

  // Headline chapter metrics — sourced from the live tables, not from witness
  // posts: gatherings + hosts from approved gatherings, neighbors from the
  // approved member roster, replicated from witness posts that cite a source.
  const [metrics, setMetrics] = useState({ gatherings: 0, hosts: 0, neighbors: 0, replicated: 0 });

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from('witness_posts')
        .select(
          'id, author_id, workshop_id, replicated_from_post_id, craft, body, language, fruit_count, fruit_unit, occurred_at'
        )
        .eq('status', 'approved')
        .order('occurred_at', { ascending: false });

      if (error) {
        console.error('Failed to load witness posts:', error);
      } else if (data) {
        setPosts((data as WitnessRow[]).map(adaptRow));
      }
      setLoading(false);
    })();
  }, []);

  // Load the headline metrics. These read approved rows the public can already
  // see (the gatherings_public view; approved profiles, as the parish map does),
  // so no elevated access is needed. A gathering counts the moment it's
  // approved; a neighbor counts the moment their profile is approved.
  useEffect(() => {
    (async () => {
      const [gatherings, members, replicated] = await Promise.all([
        supabase.from('gatherings_public').select('host_id'),
        supabase.rpc('approved_member_count'),
        supabase
          .from('witness_posts')
          .select('id', { count: 'exact', head: true })
          .eq('status', 'approved')
          .not('replicated_from_post_id', 'is', null),
      ]);

      if (gatherings.error) console.error('metrics: gatherings', gatherings.error);
      if (members.error) console.error('metrics: members', members.error);
      if (replicated.error) console.error('metrics: replicated', replicated.error);

      const gatheringRows = (gatherings.data ?? []) as unknown as Array<{ host_id: string | null }>;
      setMetrics({
        gatherings: gatheringRows.length,
        hosts: new Set(gatheringRows.map((r) => r.host_id).filter(Boolean)).size,
        neighbors: (members.data as number) ?? 0,
        replicated: replicated.count ?? 0,
      });
    })();
  }, []);

  const postsByMonth = useMemo(() => {
    const map: Record<number, WitnessPost[]> = {};
    for (const p of posts) {
      const m = new Date(p.date).getMonth();
      (map[m] ||= []).push(p);
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

  return (
    <Layout>
      <section className="container-wide pb-24 pt-20">
        <header className="mb-8 text-center">
          <p className="display-caps text-[11px] tracking-[0.3em] text-ocre">
            {t(s.eyebrow)}
          </p>
          <h1 className="mt-2 font-heading text-[30px] leading-[1.15] text-mesquite md:text-4xl">
            {t(s.heading)}
          </h1>
          <p className="prose-body mt-1 text-sm italic text-piedra">{t(s.subhead)}</p>
        </header>

        {loading ? (
          <p className="mt-16 text-center font-serif italic text-piedra/60">…</p>
        ) : (
          <>
            <div className="mx-auto mb-10 grid max-w-2xl grid-cols-4 gap-3">
              <Stat n={metrics.gatherings} label={t(s.statGatherings)} />
              <Stat n={metrics.hosts} label={t(s.statHosts)} />
              <Stat n={metrics.neighbors} label={t(s.statNeighbors)} />
              <Stat n={metrics.replicated} label={t(s.statReplicated)} />
            </div>

            <div className="mx-auto grid max-w-4xl grid-cols-1 items-start gap-8 md:grid-cols-[380px_1fr]">
              <div>
                <YearWheel
                  posts={posts}
                  selectedMonth={selectedMonth}
                  onSelectMonth={setSelectedMonth}
                  locale={locale}
                />
              </div>
              <div>
                <MonthPanel
                  month={selectedMonth}
                  posts={monthPosts}
                  locale={locale}
                  override={monthTotals[selectedMonth] ?? null}
                  onAskAboutPost={() => {}}
                  onAskMetric={() => {}}
                />
              </div>

              <MonthSummaries year={WHEEL_YEAR} month={selectedMonth} />

              <MonthCarousel year={WHEEL_YEAR} month={selectedMonth} locale={locale} />

            </div>

            {posts.length === 0 && (
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

const Stat = ({ n, label }: { n: number; label: string }) => (
  <div className="border border-mesquite/12 bg-cal/40 px-3 py-2.5 text-center">
    <div className="font-heading text-[22px] leading-none text-mesquite">{n}</div>
    <div className="mt-1 font-caps text-[9px] tracking-[0.15em] text-ocre">
      {label.toUpperCase()}
    </div>
  </div>
);

export default Testimonio;