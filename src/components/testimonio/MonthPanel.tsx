import { useEffect, useRef, useState } from 'react';
import type { Locale, WitnessPost } from '@/lib/types';
import { Icon } from '@/components/Icon';
import { feasts } from '@/lib/fixtures/feasts';
import { seasonByMonth, seasonMeta } from '@/lib/fixtures/seasons';
import { members } from '@/lib/fixtures/members';
import { uiStrings } from '@/lib/fixtures/uiStrings';
import { WheatStem } from '@/components/testimonio/WheatStem';

type Props = {
  month: number;
  posts: WitnessPost[];      // posts already filtered to this month
  locale: Locale;
  // Manual per-month totals (from month_metrics). When set, these override the
  // numbers derived from witness posts.
  override?: { gatherings: number; neighbors: number; hosts: number } | null;
  onAskAboutPost?: (post: WitnessPost) => void;
  onAskMetric?: (kind: 'gatherings' | 'neighbors' | 'hosts') => void;
};

/**
 * The month panel — the "look-closer" half of the Year Wheel.
 *
 * Layout: season/month header → three metric tiles → optional banners
 * (feast, skill replication) → one card per witness post → or, if the
 * month has nothing, a quiet "the land has seasons" line.
 */
export const MonthPanel = ({ month, posts, locale, override, onAskAboutPost, onAskMetric }: Props) => {
  const s = uiStrings.witness;
  const monthNames = locale === 'es' ? uiStrings.months.es : uiStrings.months.en;
  const monthName = monthNames[month];
  const seasonLabel = seasonMeta[seasonByMonth[month]].label[locale];

  const heldPosts = posts.filter((p) => !p.planned);
  const plannedPosts = posts.filter((p) => p.planned);
  const neighbors = heldPosts.reduce((sum, p) => sum + p.fruit.count, 0);
  const hosts = new Set(heldPosts.map((p) => p.hostId)).size;
  const monthFeasts = feasts.filter((f) => f.month === month);

  // Sort posts within the month ascending by date so the earliest reads first.
  const orderedPosts = [...posts].sort((a, b) => a.date.localeCompare(b.date));

  // A month can carry activity two ways: individual witness cards, or manual
  // monthly totals set by a steward (month_metrics → `override`). Treat the
  // month as "quiet" only when neither is present — otherwise a month with a
  // recorded gathering was wrongly reading as empty.
  const hasCards = orderedPosts.length > 0;
  const hasRecordedActivity = !!override && override.gatherings > 0;
  const isQuiet = !hasCards && !hasRecordedActivity;

  return (
    <div className="min-h-[380px]">
      <div className="display-caps text-[11px] tracking-[0.25em] text-ocre">
        {seasonLabel.toUpperCase()} · {monthName.toUpperCase()} 2026
      </div>
      <div className="mt-0.5 mb-3 font-heading text-[26px] leading-none text-mesquite">
        {monthName}
      </div>

      {/* Metrics — stacked editorial figures that sit alongside the wheel and
          give the column vertical presence. Numbers count up on month select. */}
      <div className="mb-5 divide-y divide-mesquite/10 border-y border-mesquite/10">
        <MetricRow
          n={override ? override.gatherings : heldPosts.length + (plannedPosts.length ? `+${plannedPosts.length}` : '')}
          label={override ? s.metricGatherings[locale] : (plannedPosts.length ? s.metricHeld[locale] : s.metricGatherings[locale])}
          onClick={() => onAskMetric?.('gatherings')}
        />
        <MetricRow
          n={override ? override.neighbors : neighbors}
          label={s.metricNeighbors[locale]}
          onClick={() => onAskMetric?.('neighbors')}
        />
        <MetricRow
          n={override ? override.hosts : hosts}
          label={s.metricHosts[locale]}
          onClick={() => onAskMetric?.('hosts')}
        />
      </div>

      {/* Feast banners */}
      {monthFeasts.map((f) => (
        <div
          key={f.id}
          className="mb-3 border-l-2 border-rojo bg-rojo/5 px-3.5 py-2.5 text-sm leading-snug text-mesquite"
        >
          <span className="mb-1 block font-caps text-[9px] tracking-[0.2em] text-rojo">
            {s.feastLabel[locale]} · {monthName.toUpperCase()} {f.day}
          </span>
          {f.name[locale]}
          {f.patronOfChapter && (
            <span className="text-piedra italic"> — {locale === 'es' ? 'patrono del capítulo' : 'patron of the chapter'}</span>
          )}
        </div>
      ))}

      {/* Replication banner(s) — one per replicated post this month */}
      {heldPosts
        .filter((p) => p.replicated)
        .map((p) => {
          const from = members.find((m) => m.id === p.replicated!.fromMemberId);
          const to = members.find((m) => m.id === p.replicated!.toMemberId);
          return (
            <div
              key={`rep-${p.id}`}
              className="mb-3 border-l-2 border-ocre bg-ocre/10 px-3.5 py-2.5 text-sm leading-snug text-mesquite"
            >
              <span className="mb-1 block font-caps text-[9px] tracking-[0.2em] text-ocre">
                {s.replicatedLabel[locale]}
              </span>
              {from?.name ?? '—'} → {to?.name ?? '—'} · {p.replicated!.skill[locale]}
            </div>
          );
        })}

      {/* Truly quiet month → wheat placeholder + seasons line. When gatherings
          were recorded, the recap + photos render below, so the panel adds
          nothing here. Otherwise → the witness cards. */}
      {isQuiet ? (
        <div className="flex flex-col items-center py-6 text-center">
          <WheatStem size={76} className="text-ocre/45" />
          <p className="prose-body mt-3 max-w-[16rem] text-sm italic leading-relaxed text-piedra whitespace-pre-line">
            {s.emptyMonth[locale]}
          </p>
        </div>
      ) : !hasCards ? null : (
        orderedPosts.map((post) => {
          const host = members.find((m) => m.id === post.hostId);
          const day = new Date(post.date).getDate();
          const planned = post.planned ? ` · ${s.plannedTag[locale]}` : '';
          return (
            <button
              key={post.id}
              type="button"
              onClick={() => onAskAboutPost?.(post)}
              className="mb-2.5 grid w-full grid-cols-[28px_1fr] items-start gap-2.5 border border-mesquite/15 bg-cal/60 px-3.5 py-3 text-left transition-colors hover:border-ocre/50 hover:bg-cal"
            >
              <div className="pt-0.5 text-mesquite">
                <Icon slug={post.iconSlug} size={24} locale={locale} />
              </div>
              <div>
                <div className="mb-0.5 font-caps text-[9px] tracking-[0.2em] text-ocre">
                  {monthName.toUpperCase()} {day} · {host?.name.toUpperCase() ?? ''}
                  {planned}
                </div>
                <div className="prose-body mb-1 text-[14px] leading-snug text-mesquite">
                  “{post.body[locale]}”
                </div>
                <div className="text-xs italic text-piedra">
                  {host?.parish ?? ''}
                  {post.fruit && ` · ${post.fruit.count} ${post.fruit.unit[locale]}`}
                </div>
              </div>
            </button>
          );
        })
      )}
    </div>
  );
};

/**
 * Metric row — a caps label paired with a large figure, stacked into a column
 * beside the wheel. Reads as an editorial stat line rather than a boxed tile.
 */
const MetricRow = ({
  n,
  label,
  onClick,
}: {
  n: number | string;
  label: string;
  onClick?: () => void;
}) => (
  <button
    type="button"
    onClick={onClick}
    className="flex w-full items-baseline justify-between py-5 text-left transition-colors hover:bg-ocre/[0.05]"
  >
    <span className="font-caps text-[10px] tracking-[0.22em] text-ocre">{label.toUpperCase()}</span>
    <span className="font-heading text-[38px] leading-none text-mesquite tabular-nums">
      {typeof n === 'number' ? <AnimatedNumber value={n} /> : n}
    </span>
  </button>
);

/**
 * Counts a figure up to its value, re-running whenever the value changes — i.e.
 * when a new month is selected, so the numbers "drop in" rather than snapping.
 * Honors prefers-reduced-motion by jumping straight to the value.
 */
const AnimatedNumber = ({ value, duration = 650 }: { value: number; duration?: number }) => {
  const [display, setDisplay] = useState(value);
  const fromRef = useRef(value);

  useEffect(() => {
    const to = value;
    const from = fromRef.current;
    const reduce =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (from === to || reduce) {
      setDisplay(to);
      fromRef.current = to;
      return;
    }
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
      setDisplay(Math.round(from + (to - from) * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
      else fromRef.current = to;
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, duration]);

  return <>{display}</>;
};