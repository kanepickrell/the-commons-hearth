// src/lib/geo/chapterRegion.ts
//
// Approximate service territory for CLM Central Texas — a soft outline that
// covers the San Antonio ↔ Austin corridor (I-35) and the eastern Hill Country.
// This is NOT a precise political or diocesan boundary; it's a hand-placed
// "this is our ground" shape for the parish map, drawn once so that every
// parish inside the corridor — current or future — falls within it with no
// code changes.
//
// Coordinates are [lat, lng] (the order Leaflet expects), traced clockwise
// from the south. To reshape: nudge, add, or remove vertices. Keep it
// convex-ish and rounded so it reads as a region, not a jagged border.
//
// Want a pure SA–Austin band without the far western Hill Country? Pull the
// three western vertices (Bandera/Kerrville/Fredericksburg) eastward.

export const CHAPTER_REGION: [number, number][] = [
  [29.20, -98.55], // S  — below San Antonio
  [29.45, -98.95], // SW — toward Bandera
  [29.95, -99.25], // W  — Kerrville
  [30.30, -98.90], // NW — Fredericksburg
  [30.48, -98.25], // N  — Johnson City / Dripping Springs
  [30.48, -97.60], // NE — north of Austin
  [30.25, -97.50], // E  — east of Austin
  [29.80, -97.70], // SE — corridor: San Marcos / New Braunfels edge
  [29.40, -97.85], // S  — toward Seguin
];