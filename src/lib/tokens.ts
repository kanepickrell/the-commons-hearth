// src/lib/tokens.ts
// Resolve a brand color token to a concrete color string.
//
// Most of the site reaches the palette through Tailwind (`text-ocre`) or CSS
// (`hsl(var(--ocre))`). Leaflet cannot: it writes vector colors onto SVG
// *presentation attributes* (`stroke="…"`), and `var()` is only resolved in
// CSS declarations, never in an attribute. Passing `hsl(var(--ocre))` as a
// Leaflet pathOption silently paints nothing.
//
// So anything handed to Leaflet reads the token's computed value first. The
// stylesheet stays the one place the palette is defined — see :root in
// index.css — and no hex ever gets copied into a component.

export const BRAND_TOKENS = ['cal', 'mesquite', 'ocre', 'rojo', 'azul', 'piedra', 'verde'] as const;

export type BrandToken = (typeof BRAND_TOKENS)[number];

export const isBrandToken = (v: unknown): v is BrandToken =>
  typeof v === 'string' && (BRAND_TOKENS as readonly string[]).includes(v);

const cache = new Map<string, string>();

/**
 * `tokenColor('ocre')` → `hsl(32 56% 51%)`, `tokenColor('ocre', 0.25)` →
 * `hsl(32 56% 51% / 0.25)`.
 *
 * Cached, because this is called once per vector per render and a computed
 * style read forces layout. Themes here are static, so a changed token would
 * need a reload — which is the same deal Tailwind's compiled classes give.
 */
export const tokenColor = (token: BrandToken, alpha?: number): string => {
  const key = alpha === undefined ? token : `${token}/${alpha}`;
  const hit = cache.get(key);
  if (hit) return hit;

  const raw =
    typeof window === 'undefined'
      ? ''
      : getComputedStyle(document.documentElement).getPropertyValue(`--${token}`).trim();

  // Empty only where no stylesheet has loaded (SSR, a bare test renderer).
  // The var() form is still the honest answer there, and nothing is painted
  // in those environments anyway.
  const value = raw
    ? alpha === undefined
      ? `hsl(${raw})`
      : `hsl(${raw} / ${alpha})`
    : `hsl(var(--${token})${alpha === undefined ? '' : ` / ${alpha}`})`;

  if (raw) cache.set(key, value);
  return value;
};
