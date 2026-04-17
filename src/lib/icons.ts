// Central icon map. Components reference icons through this map and never
// hardcode file paths — final hand-drawn icons are swapped by replacing
// files in /public/icons/placeholder/, not by editing components.

import type { IconSlug, Bilingual } from './types';

export type IconMeta = {
  slug: IconSlug;
  src: string;          // public path
  name: Bilingual;      // Spanish first, English gloss
};

const base = '/icons/placeholder';

export const iconMap: Record<IconSlug, IconMeta> = {
  'la-milpa':   { slug: 'la-milpa',   src: `${base}/la-milpa.png`,   name: { es: 'La Milpa',    en: 'The three-sisters bed' } },
  'las-abejas': { slug: 'las-abejas', src: `${base}/las-abejas.png`, name: { es: 'Las Abejas',  en: 'The honeybees' } },
  'la-gallina': { slug: 'la-gallina', src: `${base}/la-gallina.png`, name: { es: 'La Gallina',  en: 'The hen' } },
  'el-pan':     { slug: 'el-pan',     src: `${base}/el-pan.png`,     name: { es: 'El Pan',      en: 'The bread' } },
  'la-conserva':{ slug: 'la-conserva',src: `${base}/la-conserva.png`,name: { es: 'La Conserva', en: 'The preserve jar' } },
  'la-cisterna':{ slug: 'la-cisterna',src: `${base}/la-cisterna.png`,name: { es: 'La Cisterna', en: 'The cistern' } },
  'la-azuela':  { slug: 'la-azuela',  src: `${base}/la-azuela.png`,  name: { es: 'La Azuela',   en: 'The adze' } },
  'el-telar':   { slug: 'el-telar',   src: `${base}/el-telar.png`,   name: { es: 'El Telar',    en: 'The loom' } },
  'el-jabon':   { slug: 'el-jabon',   src: `${base}/el-jabon.png`,   name: { es: 'El Jabón',    en: 'The soap' } },
  'las-yerbas': { slug: 'las-yerbas', src: `${base}/las-yerbas.png`, name: { es: 'Las Yerbas',  en: 'The herbs' } },
};

export const allIcons = Object.values(iconMap);
