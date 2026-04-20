import { useMemo } from 'react';
import type { Locale, WitnessPost } from '@/lib/types';
import { iconMap } from '@/lib/icons';
import { feasts } from '@/lib/fixtures/feasts';
import { seasonByMonth, seasonMeta } from '@/lib/fixtures/seasons';
import { uiStrings } from '@/lib/fixtures/uiStrings';
import { WHEEL, polar, arcPath } from './wheelGeometry';

type Props = {
  posts: WitnessPost[];
  selectedMonth: number;
  onSelectMonth: (m: number) => void;
  locale: Locale;
};

/**
 * The wheel renders three concentric layers:
 *   - outermost rim: a fruit glyph per month (if any gathering happened)
 *   - middle band: tinted wedges colored by liturgical season
 *   - hub: the chapter's year + currently-viewed month
 *
 * Feast days are radial tick marks with a tiny cross on the rim. Native
 * SVG <title> elements make them hoverable without overlay markup.
 *
 * The fruit glyph for each month is the *first* post's craft icon. If
 * a month has more than one, a small "× N" italic label sits inside.
 * This is a known compromise — see notes in Testimonio.tsx.
 */
export const YearWheel = ({ posts, selectedMonth, onSelectMonth, locale }: Props) => {
  const postsByMonth = useMemo(() => {
    const map: Record<number, WitnessPost[]> = {};
    for (const p of posts) {
      const m = new Date(p.date).getMonth();
      (map[m] ||= []).push(p);
    }
    return map;
  }, [posts]);

  const selectedMeta = seasonMeta[seasonByMonth[selectedMonth]];
  const monthNames = locale === 'es' ? uiStrings.months.es : uiStrings.months.en;
  const shortNames = locale === 'es' ? uiStrings.months.esShort : uiStrings.months.enShort;

  return (
    <svg
      width="100%"
      viewBox={`0 0 ${WHEEL.CX * 2} ${WHEEL.CY * 2}`}
      role="img"
      aria-label={locale === 'es' ? 'Rueda del año litúrgico' : 'Liturgical year wheel'}
    >
      <title>{locale === 'es' ? 'Rueda del año' : 'The year wheel'}</title>
      <desc>
        {locale === 'es'
          ? 'Doce meses alrededor de una rueda, marcados con estaciones litúrgicas y días de fiesta.'
          : 'Twelve months around a wheel, marked with liturgical seasons and feast days.'}
      </desc>

      {/* Season wedges */}
      {Array.from({ length: 12 }, (_, i) => {
        const startA = i * WHEEL.WEDGE_ANGLE;
        const endA = startA + WHEEL.WEDGE_ANGLE;
        const season = seasonByMonth[i];
        const meta = seasonMeta[season];
        const isSelected = i === selectedMonth;
        const fill = isSelected ? darken(meta.fill) : meta.fill;

        return (
          <path
            key={`wedge-${i}`}
            d={arcPath(WHEEL.CX, WHEEL.CY, WHEEL.R_OUTER, WHEEL.R_SEASON_INNER, startA, endA)}
            fill={fill}
            stroke={meta.stroke}
            strokeWidth={0.5}
            style={{ cursor: 'pointer', transition: 'fill 0.15s' }}
            onClick={() => onSelectMonth(i)}
          >
            <title>{`${monthNames[i]} · ${meta.label[locale]}`}</title>
          </path>
        );
      })}

      {/* Selection outline */}
      <path
        d={arcPath(
          WHEEL.CX,
          WHEEL.CY,
          WHEEL.R_OUTER,
          WHEEL.R_SEASON_INNER,
          selectedMonth * WHEEL.WEDGE_ANGLE,
          selectedMonth * WHEEL.WEDGE_ANGLE + WHEEL.WEDGE_ANGLE
        )}
        fill="none"
        stroke="hsl(32 56% 51%)"
        strokeWidth={2}
        pointerEvents="none"
      />

      {/* Month labels (outside rim) */}
      {Array.from({ length: 12 }, (_, i) => {
        const labelAngle = i * WHEEL.WEDGE_ANGLE + WHEEL.WEDGE_ANGLE / 2;
        const pos = polar(WHEEL.CX, WHEEL.CY, WHEEL.R_OUTER + 10, labelAngle);
        return (
          <text
            key={`label-${i}`}
            x={pos.x}
            y={pos.y}
            textAnchor="middle"
            dominantBaseline="middle"
            fontFamily="'Marcellus SC', Georgia, serif"
            fontSize={10}
            letterSpacing="0.15em"
            fill="hsl(92 24% 25%)"
            pointerEvents="none"
          >
            {shortNames[i].toUpperCase()}
          </text>
        );
      })}

      {/* Fruit glyphs per month */}
      {Array.from({ length: 12 }, (_, i) => {
        const ps = postsByMonth[i] || [];
        if (ps.length === 0) return null;
        const primary = ps[0];
        const glyph = iconMap[primary.iconSlug]?.svg;
        if (!glyph) return null;
        const angle = i * WHEEL.WEDGE_ANGLE + WHEEL.WEDGE_ANGLE / 2;
        const pos = polar(WHEEL.CX, WHEEL.CY, WHEEL.R_FRUITS, angle);
        const isPlanned = primary.planned === true;
        return (
          <g key={`fruit-${i}`} pointerEvents="none" opacity={isPlanned ? 0.35 : 1}>
            <foreignObject x={pos.x - 11} y={pos.y - 11} width={22} height={22}>
              <div
                xmlns="http://www.w3.org/1999/xhtml"
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
                x={polar(WHEEL.CX, WHEEL.CY, WHEEL.R_FRUITS - 20, angle).x}
                y={polar(WHEEL.CX, WHEEL.CY, WHEEL.R_FRUITS - 20, angle).y}
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

      {/* Feast-day tick marks + crosses */}
      {feasts.map((f) => {
        const dayFrac = (f.day - 1) / 30;
        const angle = f.month * WHEEL.WEDGE_ANGLE + dayFrac * WHEEL.WEDGE_ANGLE;
        const p1 = polar(WHEEL.CX, WHEEL.CY, WHEEL.R_SEASON_INNER, angle);
        const p2 = polar(WHEEL.CX, WHEEL.CY, WHEEL.R_OUTER, angle);
        const crossPos = polar(WHEEL.CX, WHEEL.CY, WHEEL.R_OUTER - 4, angle);
        return (
          <g key={f.id} pointerEvents="none">
            <line
              x1={p1.x}
              y1={p1.y}
              x2={p2.x}
              y2={p2.y}
              stroke="hsl(0 61% 30%)"
              strokeWidth={0.8}
              strokeDasharray="2,2"
            >
              <title>{f.name[locale]}</title>
            </line>
            <g transform={`translate(${crossPos.x} ${crossPos.y})`}>
              <line x1={0} y1={-3} x2={0} y2={3} stroke="hsl(0 61% 30%)" strokeWidth={1} />
              <line x1={-2} y1={0} x2={2} y2={0} stroke="hsl(0 61% 30%)" strokeWidth={1} />
            </g>
          </g>
        );
      })}

      {/* Hub */}
      <circle
        cx={WHEEL.CX}
        cy={WHEEL.CY}
        r={WHEEL.R_HUB}
        fill="rgba(255,255,255,0.4)"
        stroke="rgba(62,79,47,0.25)"
        strokeWidth={0.5}
      />
      <text
        x={WHEEL.CX}
        y={WHEEL.CY - 12}
        textAnchor="middle"
        fontFamily="'Marcellus SC', Georgia, serif"
        fontSize={9}
        letterSpacing="0.2em"
        fill="hsl(32 56% 51%)"
      >
        {selectedMeta.label[locale].toUpperCase()}
      </text>
      <text
        x={WHEEL.CX}
        y={WHEEL.CY + 8}
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
        y={WHEEL.CY + 28}
        textAnchor="middle"
        fontFamily="'Marcellus SC', Georgia, serif"
        fontSize={9}
        letterSpacing="0.2em"
        fill="hsl(218 17% 35%)"
      >
        2026
      </text>
    </svg>
  );
};

/**
 * Bump an `rgba(...)` color up in opacity. Used to darken a season wedge
 * on selection. If the regex doesn't match (unexpected color format) we
 * return the original — fail quietly rather than throw.
 */
function darken(rgba: string): string {
  return rgba.replace(/([\d.]+)\)$/, (_, m) => {
    const v = parseFloat(m);
    return `${Math.min(v * 2 + 0.05, 0.35)})`;
  });
}
