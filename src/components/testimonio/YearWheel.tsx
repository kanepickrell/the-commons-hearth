import { useMemo } from 'react';
import type { Locale, WitnessPost } from '@/lib/types';
import { iconMap } from '@/lib/icons';
import { feasts } from '@/lib/fixtures/feasts';
import { seasonMeta } from '@/lib/fixtures/seasons';
import { uiStrings } from '@/lib/fixtures/uiStrings';
import {
  SEASON_COLOR,
  angleOfDate,
  angleAfterDate,
  dominantSeasonOfMonth,
  feastDate,
  seasonRanges,
} from '@/lib/liturgical';
import { WHEEL, polar, arcPath } from './wheelGeometry';

type Props = {
  posts: WitnessPost[];
  /** The civil year the wheel represents. */
  year: number;
  selectedMonth: number;
  onSelectMonth: (m: number) => void;
  locale: Locale;
  /**
   * Months the chapter actually met in. Wider than `posts` — a month can carry
   * recorded gatherings (month_metrics) without anyone having written a witness
   * post yet, and those months should still read as lived-in.
   */
  activeMonths?: ReadonlySet<number>;
  /** Today, in chapter time. Marked on the rim when it falls inside `year`. */
  today?: Date;
};

/**
 * The year wheel — the chapter's year as one object you can look at.
 *
 * Four concentric layers, read outward:
 *   - hub: the selected month and the season it mostly falls in
 *   - month band: twelve clickable cells, tinted where the chapter met
 *   - fruit glyphs: the craft of each month's first witness post
 *   - season ring: the liturgical year drawn from REAL dates — Lent starts on
 *     Ash Wednesday, not on March 1 (see src/lib/liturgical.ts)
 *
 * Feast days are dashed radial ticks with a cross on the ring; today is an
 * ocre hand. Native SVG <title> makes every mark hoverable without overlay
 * markup, and the month cells are real buttons for keyboard users.
 */
export const YearWheel = ({
  posts,
  year,
  selectedMonth,
  onSelectMonth,
  locale,
  activeMonths,
  today,
}: Props) => {
  const postsByMonth = useMemo(() => {
    const map: Record<number, WitnessPost[]> = {};
    for (const p of posts) {
      const d = new Date(p.date);
      if (d.getFullYear() !== year) continue;
      (map[d.getMonth()] ||= []).push(p);
    }
    return map;
  }, [posts, year]);

  // The liturgical year, as arcs. Computed from Easter, so it is correct for
  // this particular year rather than an average of all years.
  const ranges = useMemo(() => seasonRanges(year), [year]);

  const monthNames = locale === 'es' ? uiStrings.months.es : uiStrings.months.en;
  const shortNames = locale === 'es' ? uiStrings.months.esShort : uiStrings.months.enShort;

  const selectedSeason = dominantSeasonOfMonth(year, selectedMonth);
  const selectedSeasonLabel = seasonMeta[selectedSeason].label[locale];

  const showToday = !!today && today.getFullYear() === year;

  const isLived = (m: number) => (postsByMonth[m]?.length ?? 0) > 0 || !!activeMonths?.has(m);

  return (
    <svg
      width="100%"
      viewBox={`${-WHEEL.PAD} ${-WHEEL.PAD} ${WHEEL.CX * 2 + WHEEL.PAD * 2} ${WHEEL.CY * 2 + WHEEL.PAD * 2}`}
      role="group"
      aria-label={locale === 'es' ? 'Rueda del año litúrgico' : 'Liturgical year wheel'}
    >
      <desc>
        {locale === 'es'
          ? 'Doce meses alrededor de una rueda, con las estaciones litúrgicas y los días de fiesta del capítulo.'
          : 'Twelve months around a wheel, marked with the liturgical seasons and the feasts the chapter keeps.'}
      </desc>

      {/* ---------------------------------------------------------------- */}
      {/* Season ring — the true liturgical year                           */}
      {/* ---------------------------------------------------------------- */}
      {ranges.map((r, i) => {
        const start = angleOfDate(r.start);
        // The final stretch ends on Dec 31, whose "day after" wraps to 0.
        const raw = angleAfterDate(r.end);
        const end = raw <= start ? 360 : raw;
        const color = SEASON_COLOR[r.season];
        return (
          <path
            key={`season-${i}`}
            d={arcPath(WHEEL.CX, WHEEL.CY, WHEEL.R_SEASON_OUTER, WHEEL.R_SEASON_INNER, start, end)}
            fill={color.rule}
            stroke={color.ink}
            strokeWidth={0.4}
            strokeOpacity={0.5}
          >
            <title>{`${seasonMeta[r.season].label[locale]}`}</title>
          </path>
        );
      })}

      {/* ---------------------------------------------------------------- */}
      {/* Month band — twelve cells, tinted where the chapter met          */}
      {/* ---------------------------------------------------------------- */}
      {Array.from({ length: 12 }, (_, i) => {
        const startA = i * WHEEL.WEDGE_ANGLE;
        const endA = startA + WHEEL.WEDGE_ANGLE;
        const isSelected = i === selectedMonth;
        const lived = isLived(i);

        // A month the chapter met in carries a visible wash; a quiet month is
        // nearly bare. The year fills in as it is lived, which is the whole
        // promise of the page.
        const fill = isSelected
          ? 'rgba(198,139,62,0.16)'
          : lived
            ? 'rgba(62,79,47,0.09)'
            : 'rgba(62,79,47,0.025)';

        return (
          <path
            key={`month-${i}`}
            className="wheel-month"
            d={arcPath(WHEEL.CX, WHEEL.CY, WHEEL.R_MONTH_OUTER, WHEEL.R_MONTH_INNER, startA, endA)}
            fill={fill}
            stroke="rgba(62,79,47,0.18)"
            strokeWidth={0.5}
            role="button"
            tabIndex={0}
            aria-pressed={isSelected}
            aria-label={`${monthNames[i]} ${year}`}
            style={{ cursor: 'pointer' }}
            onClick={() => onSelectMonth(i)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onSelectMonth(i);
              }
              if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
                e.preventDefault();
                onSelectMonth((i + 1) % 12);
              }
              if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
                e.preventDefault();
                onSelectMonth((i + 11) % 12);
              }
            }}
          >
            <title>{`${monthNames[i]} · ${seasonMeta[dominantSeasonOfMonth(year, i)].label[locale]}`}</title>
          </path>
        );
      })}

      {/* Selected month outline, drawn over the band so it reads as one cell */}
      <path
        d={arcPath(
          WHEEL.CX,
          WHEEL.CY,
          WHEEL.R_MONTH_OUTER,
          WHEEL.R_MONTH_INNER,
          selectedMonth * WHEEL.WEDGE_ANGLE,
          selectedMonth * WHEEL.WEDGE_ANGLE + WHEEL.WEDGE_ANGLE
        )}
        fill="none"
        stroke="hsl(32 56% 51%)"
        strokeWidth={1.75}
        pointerEvents="none"
      />

      {/* ---------------------------------------------------------------- */}
      {/* Month labels, outside the rim                                    */}
      {/* ---------------------------------------------------------------- */}
      {Array.from({ length: 12 }, (_, i) => {
        const labelAngle = i * WHEEL.WEDGE_ANGLE + WHEEL.WEDGE_ANGLE / 2;
        const pos = polar(WHEEL.CX, WHEEL.CY, WHEEL.R_LABELS, labelAngle);
        const isSelected = i === selectedMonth;
        return (
          <text
            key={`label-${i}`}
            x={pos.x}
            y={pos.y}
            textAnchor="middle"
            dominantBaseline="middle"
            fontFamily="'Marcellus SC', Georgia, serif"
            fontSize={9.5}
            letterSpacing="0.12em"
            fill={isSelected ? 'hsl(32 56% 51%)' : 'hsl(92 24% 25%)'}
            opacity={isSelected ? 1 : 0.65}
            pointerEvents="none"
          >
            {shortNames[i].toUpperCase()}
          </text>
        );
      })}

      {/* ---------------------------------------------------------------- */}
      {/* Fruit glyphs — one per month that has a witness post             */}
      {/* ---------------------------------------------------------------- */}
      {Array.from({ length: 12 }, (_, i) => {
        const ps = postsByMonth[i] || [];
        if (ps.length === 0) return null;
        const primary = ps[0];
        const glyph = iconMap[primary.iconSlug]?.svg;
        if (!glyph) return null;
        const angle = i * WHEEL.WEDGE_ANGLE + WHEEL.WEDGE_ANGLE / 2;
        const pos = polar(WHEEL.CX, WHEEL.CY, WHEEL.R_FRUITS, angle);
        const isPlanned = primary.planned === true;
        const countPos = polar(WHEEL.CX, WHEEL.CY, WHEEL.R_FRUITS - 21, angle);
        return (
          <g key={`fruit-${i}`} pointerEvents="none" opacity={isPlanned ? 0.35 : 1}>
            <foreignObject x={pos.x - 11} y={pos.y - 11} width={22} height={22}>
              <div
                style={{
                  color: 'hsl(92 24% 25%)',
                  width: 22,
                  height: 22,
                  lineHeight: 0,
                }}
                dangerouslySetInnerHTML={{ __html: glyph }}
              />
            </foreignObject>
            {ps.length > 1 && (
              <text
                x={countPos.x}
                y={countPos.y}
                textAnchor="middle"
                dominantBaseline="middle"
                fontFamily="'EB Garamond', Georgia, serif"
                fontStyle="italic"
                fontSize={10}
                fill="hsl(32 56% 51%)"
              >
                × {ps.length}
              </text>
            )}
          </g>
        );
      })}

      {/* ---------------------------------------------------------------- */}
      {/* Feast ticks — day-accurate, patron feast marked larger           */}
      {/* ---------------------------------------------------------------- */}
      {feasts.map((f) => {
        const angle = angleOfDate(feastDate(f, year));
        const p1 = polar(WHEEL.CX, WHEEL.CY, WHEEL.R_MONTH_INNER, angle);
        const p2 = polar(WHEEL.CX, WHEEL.CY, WHEEL.R_SEASON_OUTER, angle);
        const crossPos = polar(WHEEL.CX, WHEEL.CY, WHEEL.R_SEASON_OUTER + 0.5, angle);
        const arm = f.patronOfChapter ? 4 : 2.75;
        return (
          <g key={f.id} pointerEvents="none">
            {/* <title> must be the first child to act as the tooltip. */}
            <title>
              {f.name[locale]}
              {f.patronOfChapter
                ? locale === 'es'
                  ? ' — patrono del capítulo'
                  : ' — patron of the chapter'
                : ''}
            </title>
            <line
              x1={p1.x}
              y1={p1.y}
              x2={p2.x}
              y2={p2.y}
              stroke="hsl(0 61% 30%)"
              strokeWidth={0.8}
              strokeDasharray="2,2"
              opacity={0.75}
            />
            <g transform={`translate(${crossPos.x} ${crossPos.y})`}>
              <line
                x1={0}
                y1={-arm}
                x2={0}
                y2={arm}
                stroke="hsl(0 61% 30%)"
                strokeWidth={f.patronOfChapter ? 1.3 : 1}
              />
              <line
                x1={-arm * 0.68}
                y1={-arm * 0.25}
                x2={arm * 0.68}
                y2={-arm * 0.25}
                stroke="hsl(0 61% 30%)"
                strokeWidth={f.patronOfChapter ? 1.3 : 1}
              />
            </g>
          </g>
        );
      })}

      {/* ---------------------------------------------------------------- */}
      {/* Today — an ocre hand, only when the wheel shows the live year     */}
      {/* ---------------------------------------------------------------- */}
      {showToday &&
        (() => {
          const angle = angleOfDate(today!);
          // A short tick at the rim, not a full-radius hand: a hand drawn from
          // the hub crosses the whole month cell and reads as if it were
          // dividing it in two.
          const from = polar(WHEEL.CX, WHEEL.CY, WHEEL.R_MONTH_OUTER - 11, angle);
          const tip = polar(WHEEL.CX, WHEEL.CY, WHEEL.R_SEASON_INNER - 2, angle);
          return (
            <g pointerEvents="none">
              <title>{locale === 'es' ? 'Hoy' : 'Today'}</title>
              <line
                x1={from.x}
                y1={from.y}
                x2={tip.x}
                y2={tip.y}
                stroke="hsl(32 56% 51%)"
                strokeWidth={1}
                opacity={0.8}
              />
              <circle cx={tip.x} cy={tip.y} r={2.75} fill="hsl(32 56% 51%)" />
            </g>
          );
        })()}

      {/* ---------------------------------------------------------------- */}
      {/* Hub                                                              */}
      {/* ---------------------------------------------------------------- */}
      <circle
        cx={WHEEL.CX}
        cy={WHEEL.CY}
        r={WHEEL.R_HUB}
        fill="rgba(255,255,255,0.45)"
        stroke="rgba(62,79,47,0.25)"
        strokeWidth={0.5}
      />
      <text
        x={WHEEL.CX}
        y={WHEEL.CY - 15}
        textAnchor="middle"
        fontFamily="'Marcellus SC', Georgia, serif"
        fontSize={8}
        letterSpacing="0.16em"
        fill={SEASON_COLOR[selectedSeason].ink}
      >
        {selectedSeasonLabel.toUpperCase()}
      </text>
      <text
        x={WHEEL.CX}
        y={WHEEL.CY + 7}
        textAnchor="middle"
        fontFamily="'EB Garamond', Georgia, serif"
        fontSize={22}
        fontStyle="italic"
        fill="hsl(92 24% 25%)"
      >
        {monthNames[selectedMonth]}
      </text>
      <text
        x={WHEEL.CX}
        y={WHEEL.CY + 27}
        textAnchor="middle"
        fontFamily="'Marcellus SC', Georgia, serif"
        fontSize={9}
        letterSpacing="0.2em"
        fill="hsl(218 17% 35%)"
      >
        {year}
      </text>
    </svg>
  );
};

/**
 * The season key — five swatches naming the ring's colors. Sits under the
 * wheel so the band is legible without hovering, and so the vocabulary
 * (Ordinary Time, Paschaltide) is taught rather than assumed.
 */
export const SeasonKey = ({ year, locale }: { year: number; locale: Locale }) => {
  // Ordered as the year runs, not alphabetically, and de-duplicated —
  // Christmas and Ordinary Time each appear twice on the wheel.
  const order = useMemo(() => {
    const seen = new Set<string>();
    return seasonRanges(year)
      .map((r) => r.season)
      .filter((s) => (seen.has(s) ? false : (seen.add(s), true)));
  }, [year]);

  return (
    <ul className="mt-5 flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
      {order.map((s) => (
        <li key={s} className="flex items-center gap-1.5">
          <span
            aria-hidden="true"
            className="inline-block h-2 w-2 flex-shrink-0"
            style={{
              background: SEASON_COLOR[s].rule,
              border: `0.5px solid ${SEASON_COLOR[s].ink}`,
            }}
          />
          <span className="font-caps text-[9px] tracking-[0.14em] text-piedra">
            {seasonMeta[s].label[locale].toUpperCase()}
          </span>
        </li>
      ))}
      <li className="flex items-center gap-1.5">
        <span
          aria-hidden="true"
          className="inline-block h-2 w-2 flex-shrink-0 rounded-full"
          style={{ background: 'hsl(0 61% 30%)' }}
        />
        <span className="font-caps text-[9px] tracking-[0.14em] text-piedra">
          {locale === 'es' ? 'FIESTA' : 'FEAST'}
        </span>
      </li>
    </ul>
  );
};
