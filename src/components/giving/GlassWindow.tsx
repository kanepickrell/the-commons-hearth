// src/components/giving/GlassWindow.tsx
// A tool fund drawn as a stained-glass window you give by.
//
// The window is the meter and the amount picker at once. Glass comes in
// pieces of different sizes, so the size IS the amount — a small quarry is
// $10, a big one $100 — and nobody has to be asked to "choose an amount" in
// the abstract. You pick a piece of the window and light it.
//
// Why this beats a bar for this particular ask: the tool commons is about
// buying one whole thing together, and a window is the oldest picture the
// Church has of exactly that — many hands, many small gifts, one image that
// only exists because all of them are there. A half-lit window reads as
// unfinished in a way that wants finishing. A bar at 60% reads as a statistic.
//
// Three rules, all easy to get wrong:
//
//   1. The layout is SEEDED by the tool, so a given tool's window is the same
//      window on every load and every device. If the pieces moved between
//      visits, a giver could never point at the one they lit.
//   2. The pieces sum to the goal. The window is the fund, not a decoration
//      beside it, so a fully lit window means a bought tool and nothing else.
//   3. Already-lit glass isn't clickable. You can't buy a piece twice, and a
//      control that looks live and does nothing is worse than one that
//      doesn't look live.

import { useId, useMemo } from 'react';

/** Glass sizes, and what each one costs. Size is the amount. */
const TIERS = [100, 50, 25, 10] as const;

/** Lit-glass colours, from the chapter's palette. */
const GLASS = [
  'hsl(32 56% 51%)', // ocre
  'hsl(32 64% 62%)', // ocre, lighter
  'hsl(0 61% 30%)', // rojo
  'hsl(215 45% 31%)', // azul
  'hsl(92 24% 32%)', // mesquite, greened
] as const;

/** The lead, and unlit glass. */
const GLASS_DARK = 'hsl(92 24% 22%)';

type Piece = { i: number; value: number; x: number; y: number; w: number; h: number; hue: string };

const rng = (seed: number) => () => {
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

const seedFrom = (s: string) => {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
};

const W = 100;
const H = 140;
/** A lancet: straight jambs, a pointed head. Everything is clipped to this. */
const ARCH = `M6,${H - 2} L6,58 Q11,9 50,5 Q89,9 94,58 L94,${H - 2} Z`;

/**
 * Cut `goal` into glass. Bigger pieces first so a big fund doesn't become a
 * mosaic of five hundred $10 chips, then shuffled so the sizes interleave the
 * way a real window's do.
 *
 * The pieces must sum to the goal EXACTLY — a window that can never quite be
 * finished would be a cruel thing to put on a donation page. That is why $25
 * glass is cut in pairs: every tier then moves the remainder in multiples of
 * ten, so a goal that is a multiple of ten always lands on zero. ($25 alone
 * leaves remainders like 75, and the last $10 piece can't close it.)
 */
const cutGlass = (goal: number, next: () => number): number[] => {
  const values: number[] = [];
  let left = Math.max(0, Math.floor(goal / 10) * 10);

  for (const tier of TIERS) {
    const step = tier === 25 ? 50 : tier; // $25 comes in pairs
    const budget = tier === 10 ? left : Math.floor((left * 0.5) / step) * step;
    let spent = 0;
    while (spent + step <= budget) {
      values.push(tier);
      if (tier === 25) values.push(tier);
      spent += step;
    }
    left -= spent;
  }
  while (left >= 10) {
    values.push(10);
    left -= 10;
  }

  for (let i = values.length - 1; i > 0; i--) {
    const j = Math.floor(next() * (i + 1));
    [values[i], values[j]] = [values[j], values[i]];
  }
  return values;
};

/**
 * Lay the glass out as a squarified treemap.
 *
 * Rows were the obvious thing and they don't work here. With a ten-to-one
 * spread between the smallest and largest glass, any row holding both gives
 * you a $10 sliver beside a $100 slab — and the only way to avoid it with
 * rows is to sort the sizes into separate bands, which is the opposite of
 * distributing them evenly. A treemap solves both at once: area tracks the
 * amount, and the aspect ratios stay near square.
 *
 * The input is deliberately NOT sorted descending, which is what the textbook
 * algorithm does. Sorted, every large piece lands in one corner. Shuffled,
 * the sizes interleave across the whole window and the ratios are still good.
 */
const layout = (values: number[], next: () => number): Piece[] => {
  const total = values.reduce((s, v) => s + v, 0);
  if (!total) return [];

  const pieces: Piece[] = [];
  let free = { x: 0, y: 0, w: W, h: H };
  let scale = (W * H) / total;
  let i = 0;

  const worst = (row: number[], side: number) => {
    const sum = row.reduce((s, v) => s + v, 0) * scale;
    const max = Math.max(...row) * scale;
    const min = Math.min(...row) * scale;
    const s2 = side * side;
    const sum2 = sum * sum;
    return Math.max((s2 * max) / sum2, sum2 / (s2 * min));
  };

  const placeRow = (row: number[]) => {
    const sum = row.reduce((s, v) => s + v, 0) * scale;
    const vertical = free.w >= free.h;
    // The row runs along the SHORT side, which is what keeps tiles square.
    const thickness = sum / (vertical ? free.h : free.w);
    let along = 0;
    for (const v of row) {
      const len = (v * scale) / thickness;
      pieces.push(
        vertical
          ? { i: i++, value: v, x: free.x, y: free.y + along, w: thickness, h: len, hue: GLASS[Math.floor(next() * GLASS.length)] }
          : { i: i++, value: v, x: free.x + along, y: free.y, w: len, h: thickness, hue: GLASS[Math.floor(next() * GLASS.length)] },
      );
      along += len;
    }
    free = vertical
      ? { x: free.x + thickness, y: free.y, w: free.w - thickness, h: free.h }
      : { x: free.x, y: free.y + thickness, w: free.w, h: free.h - thickness };
  };

  let row: number[] = [];
  for (const v of values) {
    const side = Math.min(free.w, free.h);
    if (row.length && worst([...row, v], side) > worst(row, side)) {
      placeRow(row);
      row = [];
      // Rescale to the space that is actually left, or the last rows overflow.
      const left = values.slice(pieces.length).reduce((s, x) => s + x, 0);
      if (left > 0) scale = (free.w * free.h) / left;
    }
    row.push(v);
  }
  if (row.length) placeRow(row);

  return pieces;
};

type Props = {
  /** Stable per tool: the same tool always gets the same window. */
  seedKey: string;
  goal: number;
  raised: number;
  /** Photograph of the thing being bought. Sits behind the glass. */
  photo?: string;
  /** Fallback when there's no photograph: line art, set into the glass. */
  art?: string;
  label: string;
  /** The chosen piece. Identified by index, not value — several pieces share
      a price, and lighting all the $25 glass at once would be a lie about
      which one you picked. */
  onPick: (piece: { index: number; value: number }) => void;
  /** Index of the piece currently being given for. */
  picked?: number | null;
};

export const GlassWindow = ({
  seedKey,
  goal,
  raised,
  photo,
  art,
  label,
  onPick,
  picked = null,
}: Props) => {
  const clipId = useId();

  const { pieces, lit } = useMemo(() => {
    const next = rng(seedFrom(seedKey));
    const values = cutGlass(goal, next);
    const laid = layout(values, next);
    // Which glass is lit, in a seeded order that is NOT the layout order — so
    // a part-funded window lights up scattered across the whole picture, the
    // way one actually gets built, rather than filling from the top like a
    // bar on its side. Seeded, so it lights the same way on every load.
    const order = laid.map((p) => p.i);
    for (let i = order.length - 1; i > 0; i--) {
      const j = Math.floor(next() * (i + 1));
      [order[i], order[j]] = [order[j], order[i]];
    }
    const litSet = new Set<number>();
    let spent = 0;
    for (const i of order) {
      const v = laid[i].value;
      if (spent + v > raised) continue;
      spent += v;
      litSet.add(i);
    }
    return { pieces: laid, lit: litSet };
  }, [seedKey, goal, raised]);

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="block h-auto w-full"
      role="group"
      aria-label={label}
    >
      <defs>
        <clipPath id={clipId}>
          <path d={ARCH} />
        </clipPath>
      </defs>

      <g clipPath={`url(#${clipId})`}>
        {/* The thing itself, behind the glass. Lit pieces are a coloured
            tint you can see through; unlit ones are nearly opaque. So the
            picture arrives as the window is paid for, which is the whole
            point — you are not filling a bar, you are uncovering the tool. */}
        {photo ? (
          <image
            href={photo}
            x={0}
            y={0}
            width={W}
            height={H}
            preserveAspectRatio="xMidYMid slice"
          />
        ) : (
          art && (
            <g
              transform={`translate(${W / 2 - 24}, ${H / 2 - 30}) scale(0.5)`}
              className="text-mesquite"
              opacity={0.9}
              dangerouslySetInnerHTML={{ __html: art }}
              aria-hidden="true"
            />
          )
        )}

        {pieces.map((p) => {
          const isLit = lit.has(p.i);
          const isPicked = !isLit && picked === p.i;
          return (
            <rect
              key={p.i}
              x={p.x}
              y={p.y}
              width={p.w}
              height={p.h}
              fill={isLit || isPicked ? p.hue : GLASS_DARK}
              fillOpacity={isLit ? 0.34 : isPicked ? 0.55 : 0.93}
              stroke={GLASS_DARK}
              strokeWidth={0.9}
              style={isLit ? undefined : { cursor: 'pointer' }}
              className={
                isLit
                  ? ''
                  : 'transition-[fill-opacity] duration-300 hover:[fill-opacity:0.7] motion-reduce:transition-none'
              }
              onClick={isLit ? undefined : () => onPick({ index: p.i, value: p.value })}
              role={isLit ? undefined : 'button'}
              tabIndex={isLit ? undefined : 0}
              onKeyDown={
                isLit
                  ? undefined
                  : (e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        onPick({ index: p.i, value: p.value });
                      }
                    }
              }
              aria-label={isLit ? undefined : `$${p.value}`}
            >
              {!isLit && <title>{`$${p.value}`}</title>}
            </rect>
          );
        })}
      </g>

      {/* Came and frame, over the top. */}
      <path d={ARCH} fill="none" stroke={GLASS_DARK} strokeWidth={2.5} />
    </svg>
  );
};
