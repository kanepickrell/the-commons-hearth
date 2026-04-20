// Bilingual route slugs. Both locale paths route to the same component.
// Example: /ofrendas (es) and /offerings (en) both render the Ofrendas page.
// The active language toggle just rewrites the URL via routesFor().

import type { Locale } from '@/lib/types';

export type RouteKey =
  | 'home'
  | 'ofrendas'
  | 'ofrendaDetail'
  | 'talleres'
  | 'tallerDetail'
  | 'testimonio'
  | 'santo'
  | 'bienvenido'
  | 'miPerfil'
  | 'mayordomo';

export const routes: Record<RouteKey, { en: string; es: string }> = {
  home:          { en: '/',                   es: '/' },
  ofrendas:      { en: '/offerings',          es: '/ofrendas' },
  ofrendaDetail: { en: '/offerings/:id',      es: '/ofrendas/:id' },
  talleres:      { en: '/workshops',          es: '/talleres' },
  tallerDetail:  { en: '/workshops/:id',      es: '/talleres/:id' },
  testimonio:    { en: '/witness',            es: '/testimonio' },
  santo:         { en: '/patron',             es: '/santo' },
  bienvenido:    { en: '/welcome',            es: '/bienvenido' },
  miPerfil:      { en: '/my-profile',         es: '/mi-perfil' },
  mayordomo:     { en: '/stewardship',        es: '/mayordomo' },
};

export const buildPath = (key: RouteKey, locale: Locale, params: Record<string, string> = {}) => {
  let path = routes[key][locale];
  for (const [k, v] of Object.entries(params)) {
    path = path.replace(`:${k}`, v);
  }
  return path;
};

// Given a current pathname, return the equivalent in the target locale.
// Best-effort match: walks the route table and rewrites the first hit.
export const switchLocalePath = (pathname: string, target: Locale): string => {
  for (const [, pair] of Object.entries(routes)) {
    const fromLocale: Locale = target === 'en' ? 'es' : 'en';
    const fromPattern = pair[fromLocale];
    const matched = matchRoute(fromPattern, pathname);
    if (matched) {
      let next = pair[target];
      for (const [k, v] of Object.entries(matched)) {
        next = next.replace(`:${k}`, v);
      }
      return next;
    }
  }
  return pathname;
};

function matchRoute(pattern: string, pathname: string): Record<string, string> | null {
  const pSeg = pattern.split('/').filter(Boolean);
  const aSeg = pathname.split('/').filter(Boolean);
  if (pSeg.length !== aSeg.length) return null;
  const out: Record<string, string> = {};
  for (let i = 0; i < pSeg.length; i++) {
    if (pSeg[i].startsWith(':')) out[pSeg[i].slice(1)] = aSeg[i];
    else if (pSeg[i] !== aSeg[i]) return null;
  }
  return out;
}