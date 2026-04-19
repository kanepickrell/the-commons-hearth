// Central icon map. Components reference icons through this map and never
// hardcode paths — replacing the SVG files in /src/assets/icons/ is enough
// to swap artwork, no component changes required.
//
// SVGs are imported as raw strings (Vite ?raw) so they can be inlined into
// the DOM. That's what lets them inherit color via `currentColor` and
// participate in the ink/hover system alongside type.

import type { IconSlug, Bilingual } from './types';

import lasAbejas  from '@/assets/icons/las-abejas.svg?raw';
import laGallina  from '@/assets/icons/la-gallina.svg?raw';
import elPan      from '@/assets/icons/el-pan.svg?raw';
import laConserva from '@/assets/icons/la-conserva.svg?raw';
import laCisterna from '@/assets/icons/la-cisterna.svg?raw';
import laAzuela   from '@/assets/icons/la-azuela.svg?raw';
import elTelar    from '@/assets/icons/el-telar.svg?raw';
import lasYerbas  from '@/assets/icons/las-yerbas.svg?raw';

export type IconMeta = {
  slug: IconSlug;
  svg: string;        // raw SVG markup, uses currentColor
  name: Bilingual;    // Spanish first, English gloss
};

export const iconMap: Record<IconSlug, IconMeta> = {
  'las-abejas': { slug: 'las-abejas', svg: lasAbejas,  name: { es: 'Las Abejas',  en: 'The honeybees' } },
  'la-gallina': { slug: 'la-gallina', svg: laGallina,  name: { es: 'La Gallina',  en: 'The hen' } },
  'el-pan':     { slug: 'el-pan',     svg: elPan,      name: { es: 'El Pan',      en: 'The bread' } },
  'la-conserva':{ slug: 'la-conserva',svg: laConserva, name: { es: 'La Conserva', en: 'The preserve jar' } },
  'la-cisterna':{ slug: 'la-cisterna',svg: laCisterna, name: { es: 'La Cisterna', en: 'The cistern' } },
  'la-azuela':  { slug: 'la-azuela',  svg: laAzuela,   name: { es: 'La Azuela',   en: 'The adze' } },
  'el-telar':   { slug: 'el-telar',   svg: elTelar,    name: { es: 'El Telar',    en: 'The loom' } },
  'las-yerbas': { slug: 'las-yerbas', svg: lasYerbas,  name: { es: 'Las Yerbas',  en: 'The herbs' } },
};

export const allIcons = Object.values(iconMap);
