import { useMemo, useState } from 'react';
import { Layout } from '@/components/Layout';
import { useLocale } from '@/i18n/LocaleProvider';
import { witnessPosts } from '@/lib/fixtures/witness';
import { uiStrings } from '@/lib/fixtures/uiStrings';
import { YearWheel } from '@/components/testimonio/YearWheel';
import { MonthPanel } from '@/components/testimonio/MonthPanel';

/**
 * The Testimonio page — the public "evidence of communion" view.
 *
 * Architecture: a liturgical year wheel on the left, a month detail
 * panel on the right. Click any month on the wheel to swap the panel.
 *
 * What this page is: a living year-end artifact. Felton-style — the
 * report is both the data and the ritual. A visitor should be able to
 * scan the wheel in 10 seconds and know the chapter is real.
 *
 * What this page is not: a steward dashboard. No call sheet, no
 * isolated-member callouts, no edit affordances. Honesty about
 * chapter-level gaps (quiet months) is fine; individual-level gaps
 * belong in the steward view when we build it.
 *
 * Known rough edges (not fixing in this pass):
 *   - Liturgical seasons are month-granular (Lent moves; see seasons.ts).
 *   - A month with multiple workshops shows only the first craft's glyph
 *     on the rim, with "× N" for the rest. Variety is recovered in the
 *     panel.
 *   - Planned workshops past today are rendered as ghost glyphs — not
 *     yet wired; for now the "+N planned" count in the metric tile
 *     communicates this.
 */
const Testimonio = () => {
  const { t, locale } = useLocale();
  const s = uiStrings.witness;

  // Default to the current month. If the current month has no data
  // (likely in year one), the wheel still opens on that month and shows
  // the quiet-month line — that's the honest move.
  const [selectedMonth, setSelectedMonth] = useState<number>(() => new Date().getMonth());

  // Bucket posts by month for fast lookup and for the headline stats.
  const postsByMonth = useMemo(() => {
    const map: Record<number, typeof witnessPosts> = {};
    for (const p of witnessPosts) {
      const m = new Date(p.date).getMonth();
      (map[m] ||= []).push(p);
    }
    return map;
  }, []);

  // Headline stats — computed, not hardcoded, so they stay honest as
  // the fixture grows.
  const stats = useMemo(() => {
    const held = witnessPosts.filter((p) => !p.planned);
    const gatherings = held.length;
    const hosts = new Set(held.map((p) => p.hostId)).size;
    const neighbors = held.reduce((sum, p) => sum + p.fruit.count, 0);
    const replicated = held.filter((p) => p.replicated).length;
    return { gatherings, hosts, neighbors, replicated };
  }, []);

  const monthPosts = postsByMonth[selectedMonth] || [];

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
          <p className="prose-body mt-1 text-sm italic text-piedra">
            {t(s.subhead)}
          </p>
        </header>

        {/* Headline stats */}
        <div className="mx-auto mb-10 grid max-w-2xl grid-cols-4 gap-3">
          <Stat n={stats.gatherings} label={t(s.statGatherings)} />
          <Stat n={stats.hosts}      label={t(s.statHosts)} />
          <Stat n={stats.neighbors}  label={t(s.statNeighbors)} />
          <Stat n={stats.replicated} label={t(s.statReplicated)} />
        </div>

        {/* Wheel + panel */}
        <div className="mx-auto grid max-w-4xl grid-cols-1 items-start gap-8 md:grid-cols-[380px_1fr]">
          <div>
            <YearWheel
              posts={witnessPosts}
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
              // Actions are wired as no-ops for now — when the page is
              // lifted into claude.ai or a real chat frame we'll make
              // these fire into the steward's conversation. On the
              // static site they're harmless.
              onAskAboutPost={() => {}}
              onAskMetric={() => {}}
            />
          </div>
        </div>
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
