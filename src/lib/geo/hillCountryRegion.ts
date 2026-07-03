// src/lib/geo/hillCountryRegion.ts
//
// Approximate catchment for CLM Central Texas — a soft outline over the
// San Antonio metro reaching up into the Hill Country. This is NOT a precise
// political or diocesan boundary; it's a hand-placed "this is our ground"
// shape for the parish map, meant to be edited freely.
//
// Coordinates are [lat, lng] (the order Leaflet expects), traced clockwise.
// To reshape: nudge, add, or remove vertices. Keep it convex-ish and rounded
// so it reads as a region rather than a jagged border.

export const HILL_COUNTRY_REGION: [number, number][] = [
  [29.25, -98.35], // S — below San Antonio
  [29.28, -98.62], // SSW
  [29.45, -98.85], // SW — toward Bandera
  [29.68, -99.10], // W
  [29.95, -99.22], // WNW — Kerrville
  [30.20, -99.10], // NW — Ingram / Hunt bend
  [30.32, -98.86], // N — Fredericksburg
  [30.35, -98.55], // N — Johnson City
  [30.22, -98.22], // NE — Blanco / Wimberley
  [29.95, -98.02], // E — Canyon Lake / New Braunfels
  [29.62, -97.92], // ESE
  [29.38, -98.10], // SE — toward Seguin
];