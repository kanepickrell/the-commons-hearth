// Polar coordinate + SVG arc path math for the liturgical year wheel.
// Kept separate from the component so the math is testable and the
// JSX stays readable.

export type Point = { x: number; y: number };

/**
 * Convert polar to cartesian. Angle is degrees, 0 = 12 o'clock (top),
 * increasing clockwise — the natural convention for a wall clock / wheel.
 */
export const polar = (cx: number, cy: number, r: number, angleDeg: number): Point => {
  const rad = (angleDeg - 90) * (Math.PI / 180);
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
};

/**
 * SVG path for a ring-segment (an annular wedge) between two angles.
 * Draws outer arc clockwise, then inner arc counter-clockwise, closed.
 */
export const arcPath = (
  cx: number,
  cy: number,
  rOuter: number,
  rInner: number,
  startAngle: number,
  endAngle: number
): string => {
  const p1 = polar(cx, cy, rOuter, startAngle);
  const p2 = polar(cx, cy, rOuter, endAngle);
  const p3 = polar(cx, cy, rInner, endAngle);
  const p4 = polar(cx, cy, rInner, startAngle);
  const large = endAngle - startAngle > 180 ? 1 : 0;
  return `M ${p1.x} ${p1.y} A ${rOuter} ${rOuter} 0 ${large} 1 ${p2.x} ${p2.y} L ${p3.x} ${p3.y} A ${rInner} ${rInner} 0 ${large} 0 ${p4.x} ${p4.y} Z`;
};

/**
 * Wheel dimensions, tuned for a 380px SVG on desktop; mobile scales via the
 * viewBox. Read outward from the centre:
 *
 *   hub              the selected month, named
 *   month wedges     twelve clickable cells, tinted where the chapter met
 *   fruit glyphs     the craft of the month's first witness post
 *   season band      the true liturgical year, from real dates
 *   month labels     JAN … DEC, outside the rim
 */
export const WHEEL = {
  CX: 190,
  CY: 190,

  /** Outer edge of the thin true-season ring. */
  R_SEASON_OUTER: 174,
  R_SEASON_INNER: 160,

  /** The clickable twelve-month band. */
  R_MONTH_OUTER: 155,
  R_MONTH_INNER: 92,

  R_FRUITS: 125,
  R_HUB: 66,

  /** Radius the month name labels sit on, outside the season ring. */
  R_LABELS: 183,

  /**
   * Breathing room added around the viewBox. The month labels are centred on
   * R_LABELS, so at 3 and 9 o'clock half of "SEP"/"MAR" would hang past a
   * tight 380x380 box and get clipped. Padding the viewBox rather than pulling
   * the labels inward keeps them clear of the season ring.
   */
  PAD: 18,

  WEDGE_ANGLE: 30, // 360 / 12
} as const;
