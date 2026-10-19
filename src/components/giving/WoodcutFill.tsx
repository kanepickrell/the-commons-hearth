// src/components/giving/WoodcutFill.tsx
// A picture that inks in as it is paid for.
//
// The pattern is GiveBrick's wall and Plant-for-the-Planet's trees: a whole
// image, visibly incomplete, that fills a tile at a time. It beats a bar for
// the same reason the wheat stem does — a bar says "38%", a half-inked acre
// says "this much of it is ours" — and unlike a thermometer it carries no
// deadline, which matters for a land fund that deliberately has none.
//
// Two rules make it work, and both are easy to get wrong:
//
//   1. The reveal order is SEEDED, so it is identical on every load and on
//      every device. A reshuffle on refresh would mean the picture appeared
//      to scramble rather than grow, and a returning giver could not see
//      their own square. Same seed, same order, forever.
//   2. The tile count is the unit, not a percentage. "212 of 436 squares" is
//      a hundred square feet of actual ground; "49%" is a statistic. The
//      caller prints the count — this component never renders the number,
//      so no caller can show a percentage by accident.
//
// Two modes:
//   · No `art`  — the tiles ARE the picture. One acre, square foot by square
//     foot. This is what the Land Fund uses.
//   · `art`     — a woodcut sits underneath in outline and is revealed, inked,
//     through a mask of the paid-for tiles. For the tool cards, once there is
//     artwork for the tools to be drawn in.

import { useId, useMemo } from 'react';

type Props = {
  /** How many tiles make up the whole thing. */
  total: number;
  /** How many are paid for. Clamped into range. */
  filled: number;
  /** Tiles across. Rows follow from `total`; a short last row is centred. */
  cols: number;
  /** Accessible description, e.g. "The land fund: 212 of 436 squares". */
  label: string;
  /**
   * Raw SVG markup, drawn underneath in outline and revealed through the
   * tile mask. Must carry its own viewBox. Omit for a plain tile grid.
   */
  art?: string;
  /** Change only to deliberately re-shuffle a picture nobody has seen yet. */
  seed?: number;
  className?: string;
};

/** mulberry32 — small, fast, and identical across engines, which is the point. */
const rng = (seed: number) => () => {
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

/** A fixed shuffle of 0..n-1. Same seed in, same order out, every time. */
const shuffledOrder = (n: number, seed: number): number[] => {
  const order = Array.from({ length: n }, (_, i) => i);
  const next = rng(seed);
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(next() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  return order;
};

export const WoodcutFill = ({
  total,
  filled,
  cols,
  label,
  art,
  seed = 1891,
  className = '',
}: Props) => {
  const maskId = useId();
  const paid = Math.min(total, Math.max(0, Math.floor(filled)));
  const rows = Math.ceil(total / cols);

  // Which tiles are inked. Recomputed only when the count or the seed moves,
  // never on an unrelated re-render.
  const inked = useMemo(() => {
    const order = shuffledOrder(total, seed);
    return new Set(order.slice(0, paid));
  }, [total, seed, paid]);

  // A short final row is centred, so the ragged edge reads as an honest count
  // rather than as a missing corner. 436 squares don't make a rectangle.
  const lastRowCount = total - (rows - 1) * cols;
  const lastRowOffset = lastRowCount < cols ? (cols - lastRowCount) / 2 : 0;

  const tiles = Array.from({ length: total }, (_, i) => {
    const row = Math.floor(i / cols);
    const col = i % cols;
    return {
      i,
      x: col + (row === rows - 1 ? lastRowOffset : 0),
      y: row,
      on: inked.has(i),
    };
  });

  // A hair of inset so neighbouring squares read as laid stones rather than
  // as one solid block of colour.
  const g = 0.08;

  return (
    <svg
      viewBox={`0 0 ${cols} ${rows}`}
      className={`block h-auto w-full ${className}`}
      role="img"
      aria-label={label}
      preserveAspectRatio="xMidYMid meet"
    >
      {art ? (
        <>
          <mask id={maskId}>
            <rect x={0} y={0} width={cols} height={rows} fill="black" />
            {tiles
              .filter((t) => t.on)
              .map((t) => (
                <rect key={t.i} x={t.x} y={t.y} width={1} height={1} fill="white" />
              ))}
          </mask>

          {/* Outline underneath: the whole picture, barely there. */}
          <g
            className="text-mesquite/20"
            dangerouslySetInnerHTML={{ __html: art }}
            aria-hidden="true"
          />
          {/* Inked on top, showing only through what has been paid for. */}
          <g
            mask={`url(#${maskId})`}
            className="text-ocre"
            dangerouslySetInnerHTML={{ __html: art }}
            aria-hidden="true"
          />
        </>
      ) : (
        tiles.map((t) => (
          <rect
            key={t.i}
            x={t.x + g}
            y={t.y + g}
            width={1 - g * 2}
            height={1 - g * 2}
            // Tiles animate in, but only for readers who want motion. 400+
            // squares easing at once is a lot of movement on a quiet page.
            className={`transition-[fill,opacity] duration-500 ease-out motion-reduce:transition-none ${
              t.on ? 'fill-ocre opacity-100' : 'fill-mesquite opacity-[0.09]'
            }`}
          />
        ))
      )}
    </svg>
  );
};
