import type { Locale, WitnessPost } from '@/lib/types';
import { Icon } from '@/components/Icon';
import { feasts } from '@/lib/fixtures/feasts';
import { seasonByMonth, seasonMeta } from '@/lib/fixtures/seasons';
import { members } from '@/lib/fixtures/members';
import { uiStrings } from '@/lib/fixtures/uiStrings';

type Props = {
  month: number;
  posts: WitnessPost[];      // posts already filtered to this month
  locale: Locale;
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
export const MonthPanel = ({ month, posts, locale, onAskAboutPost, onAskMetric }: Props) => {
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

  return (
    <div className="min-h-[380px]">
      <div className="display-caps text-[11px] tracking-[0.25em] text-ocre">
        {seasonLabel.toUpperCase()} · {monthName.toUpperCase()} 2026
      </div>
      <div className="mt-0.5 mb-3 font-heading text-[26px] leading-none text-mesquite">
        {monthName}
      </div>

      {/* Metrics row */}
      <div className="mb-4 grid grid-cols-3 gap-2">
        <MetricTile
          n={heldPosts.length + (plannedPosts.length ? `+${plannedPosts.length}` : '')}
          label={plannedPosts.length ? s.metricHeld[locale] : s.metricGatherings[locale]}
          onClick={() => onAskMetric?.('gatherings')}
        />
        <MetricTile
          n={neighbors}
          label={s.metricNeighbors[locale]}
          onClick={() => onAskMetric?.('neighbors')}
        />
        <MetricTile
          n={hosts}
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

      {/* Empty state or cards */}
      {orderedPosts.length === 0 ? (
        <div className="prose-body py-5 text-center text-sm italic leading-relaxed text-piedra whitespace-pre-line">
          {s.emptyMonth[locale]}
        </div>
      ) : (
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

/** Small metric tile — number + all-caps label, clickable. */
const MetricTile = ({
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
    className="border border-mesquite/10 bg-cal/60 p-2.5 text-center transition-colors hover:bg-ocre/10"
  >
    <div className="font-heading text-[20px] leading-none text-mesquite">{n}</div>
    <div className="mt-1 font-caps text-[9px] tracking-[0.15em] text-ocre">{label}</div>
  </button>
);
