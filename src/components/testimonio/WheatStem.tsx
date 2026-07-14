// src/components/testimonio/WheatStem.tsx
// A single stem of wheat, drawn inline as SVG. Used as the quiet-month
// placeholder on the Witness page — a month with no gatherings recorded isn't
// a failed month; the land simply has its seasons.
//
// The artwork uses `currentColor` throughout, so it inherits whatever text
// color the parent sets (we render it in a muted ocre). Grains are generated
// so the ear shingles evenly; tweak `ROWS` / `SPREAD` to reshape the head.

type Props = {
  /** Rendered width in px (height scales with the 120×220 viewBox). */
  size?: number;
  className?: string;
};

// One grain: an almond that points "up" from its base near the origin.
const GRAIN = 'M0,6 C5,1.5 5,-11 0,-16 C-5,-11 -5,1.5 0,6 Z';

// Rachis points (y) where each pair of grains attaches, base → tip.
const ROWS = [70, 63, 56, 49, 42, 35, 28];
const CX = 60;

export const WheatStem = ({ size = 72, className = '' }: Props) => {
  const grains = ROWS.flatMap((y, i) => {
    const spread = 34 - i * 2; // fan wide at the base, tuck in toward the tip
    const offset = 3.4 - i * 0.2;
    return [
      { x: CX - offset, y, deg: -spread },
      { x: CX + offset, y, deg: spread },
    ];
  });

  // Awns (bristles) fanning up from the crown.
  const awns = [-18, -9, 0, 9, 18].map((a) => {
    const rad = (a * Math.PI) / 180;
    return { x2: CX + Math.sin(rad) * 28, y2: 15 - Math.cos(rad) * 28 };
  });

  return (
    <svg
      viewBox="0 0 120 220"
      width={size}
      height={(size * 220) / 120}
      role="img"
      aria-hidden="true"
      className={className}
    >
      {/* Stalk */}
      <path
        d="M60,214 C57,182 64,152 60,122 C56,96 62,82 60,68"
        fill="none"
        stroke="currentColor"
        strokeWidth={2.4}
        strokeLinecap="round"
      />
      {/* Leaf blades */}
      <path
        d="M61,150 C79,145 91,149 102,138 C90,152 79,157 62,156 Z"
        fill="currentColor"
        fillOpacity={0.13}
        stroke="currentColor"
        strokeWidth={1.3}
      />
      <path
        d="M59,170 C41,167 29,173 18,162 C31,175 43,178 58,176 Z"
        fill="currentColor"
        fillOpacity={0.13}
        stroke="currentColor"
        strokeWidth={1.3}
      />
      {/* Ear — shingled grains + crown grain */}
      {grains.map((g, i) => (
        <path
          key={i}
          d={GRAIN}
          transform={`translate(${g.x.toFixed(1)},${g.y}) rotate(${g.deg})`}
          fill="currentColor"
          fillOpacity={0.2}
          stroke="currentColor"
          strokeWidth={1.3}
          strokeLinejoin="round"
        />
      ))}
      <path
        d={GRAIN}
        transform={`translate(${CX},20)`}
        fill="currentColor"
        fillOpacity={0.2}
        stroke="currentColor"
        strokeWidth={1.3}
        strokeLinejoin="round"
      />
      {/* Awns */}
      {awns.map((a, i) => (
        <line
          key={i}
          x1={CX}
          y1={17}
          x2={a.x2.toFixed(1)}
          y2={a.y2.toFixed(1)}
          stroke="currentColor"
          strokeWidth={1}
          strokeLinecap="round"
          opacity={0.7}
        />
      ))}
    </svg>
  );
};