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

// Wheel dimensions — tuned for a 380px SVG on desktop. Mobile scales via viewBox.
export const WHEEL = {
  CX: 190,
  CY: 190,
  R_OUTER: 175,
  R_FRUITS: 140,
  R_SEASON_INNER: 90,
  R_HUB: 65,
  WEDGE_ANGLE: 30,  // 360 / 12
} as const;
