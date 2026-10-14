// src/components/SeasonLine.tsx
// The masthead dateline — one hairline row under the header, on every page,
// saying where the chapter stands in the Church's year.
//
// Glorification is one of the four pillars ("the seasons of the Church back in
// agrarian life"), and until now the site described the liturgical year without
// ever keeping it. This is the smallest honest way to keep it: the season we're
// in, today's date, and the next feast the chapter marks.
//
// Deliberately quiet. It's a dateline, not a banner — if it ever competes with
// a page heading for attention, it's too loud.

import { useMemo } from 'react';
import { useLocale } from '@/i18n/LocaleProvider';
import { seasonMeta } from '@/lib/fixtures/seasons';
import { SEASON_COLOR, seasonOn, nextFeast } from '@/lib/liturgical';
import { chapterToday, formatDate } from '@/lib/dates';

export const SeasonLine = () => {
  const { locale } = useLocale();

  // Recomputed once per mount. The season doesn't change while someone reads a
  // page, and a ticking clock here would be noise.
  const { season, today, feast } = useMemo(() => {
    const d = chapterToday();
    return { season: seasonOn(d), today: d, feast: nextFeast(d) };
  }, []);

  const color = SEASON_COLOR[season];
  const seasonLabel = seasonMeta[season].label[locale];
  const isFeastToday = feast?.daysAway === 0;

  return (
    <div
      className="border-b border-mesquite/10 bg-cal/40"
      // The season's own color as a hairline above the rule — the one place
      // Advent's blue and Lent's red reach the whole site.
      style={{ boxShadow: `inset 0 1px 0 0 ${color.rule}` }}
    >
      <div className="container-wide flex items-center justify-between gap-4 py-1.5">
        <p className="flex items-center gap-2 truncate">
          <span
            aria-hidden="true"
            className="inline-block h-1.5 w-1.5 flex-shrink-0 rotate-45"
            style={{ background: color.ink }}
          />
          <span
            className="font-caps text-[10px] tracking-[0.18em] md:text-[11px]"
            style={{ color: color.ink }}
          >
            {seasonLabel.toUpperCase()}
          </span>
          <span aria-hidden="true" className="text-mesquite/25">
            ·
          </span>
          <span className="truncate font-serif text-[11px] italic text-piedra md:text-xs">
            {formatDate(today, locale, { weekday: 'long', month: 'long', day: 'numeric' })}
          </span>
        </p>

        {/* Shown from `md` up, not `sm`: in Spanish the two halves measure
            ~292px + ~294px, which collides inside a 640px viewport's 592px
            container and clips the date. */}
        {feast && (
          <p className="hidden flex-shrink-0 items-center gap-2 md:flex">
            <span
              className="font-caps text-[10px] tracking-[0.18em]"
              style={{ color: isFeastToday ? SEASON_COLOR.lent.ink : 'hsl(32 56% 51%)' }}
            >
              {isFeastToday
                ? locale === 'es'
                  ? 'HOY'
                  : 'TODAY'
                : locale === 'es'
                  ? 'PRÓXIMA FIESTA'
                  : 'NEXT FEAST'}
            </span>
            <span className="font-serif text-[11px] italic text-piedra md:text-xs">
              {feast.feast.name[locale]}
              {!isFeastToday && (
                <>
                  {', '}
                  {formatDate(feast.date, locale, { month: 'short', day: 'numeric' })}
                </>
              )}
            </span>
          </p>
        )}
      </div>
    </div>
  );
};
