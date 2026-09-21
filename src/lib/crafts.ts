// src/lib/crafts.ts
// The craft vocabulary, in one place. Mirrors the `craft_slug` Postgres enum.
//
//  - ILLUSTRATED_CRAFTS: the eight with artwork in /src/assets/icons (see
//    lib/icons.ts). Only these can render an <Icon> or a map pin.
//  - MORE_CRAFTS: the rest of the enum, shown as text tags at signup.
//  - CRAFT_NAMES: display labels for every slug, for profile pages.
//
// Add a value to the enum in Postgres, then add its row here. If it gets
// artwork later, move it from MORE_CRAFTS to ILLUSTRATED_CRAFTS and register
// the SVG in lib/icons.ts.

import type { CraftSlug } from '@/lib/database.types';
import type { Bilingual, IconSlug } from '@/lib/types';

export type CraftOption = { slug: CraftSlug; en: string; es: string };

export const ILLUSTRATED_CRAFTS: { slug: IconSlug; en: string; es: string }[] = [
  { slug: 'las-abejas',  en: 'Bees',       es: 'Las Abejas' },
  { slug: 'la-gallina',  en: 'Hens',       es: 'La Gallina' },
  { slug: 'el-pan',      en: 'Bread',      es: 'El Pan' },
  { slug: 'la-conserva', en: 'Preserving', es: 'La Conserva' },
  { slug: 'la-cisterna', en: 'Rainwater',  es: 'La Cisterna' },
  { slug: 'la-azuela',   en: 'Woodwork',   es: 'La Azuela' },
  { slug: 'el-telar',    en: 'Textiles',   es: 'El Telar' },
  { slug: 'las-yerbas',  en: 'Herbs',      es: 'Las Yerbas' },
];

export const MORE_CRAFTS: CraftOption[] = [
  { slug: 'el-huerto',      en: 'Vegetable garden',   es: 'El Huerto' },
  { slug: 'el-invernadero', en: 'Greenhouse',         es: 'El Invernadero' },
  { slug: 'la-milpa',       en: 'Three-sisters field', es: 'La Milpa' },
  { slug: 'el-rebano',      en: 'Sheep',              es: 'El Rebaño' },
  { slug: 'el-caldo',       en: 'Broth & ferments',   es: 'El Caldo' },
  { slug: 'la-mesa',        en: 'Scratch cooking',    es: 'La Mesa' },
  { slug: 'el-jabon',       en: 'Soap',               es: 'El Jabón' },
  { slug: 'el-candelero',   en: 'Candles',            es: 'El Candelero' },
  { slug: 'el-tractor',     en: 'Land equipment',     es: 'El Tractor' },
  { slug: 'la-regla',       en: 'Homestead rhythm',   es: 'La Regla' },
  { slug: 'las-medicinas',  en: 'Natural medicine',   es: 'Las Medicinas' },
  { slug: 'la-escuela',     en: 'Home schooling',     es: 'La Escuela' },
  { slug: 'el-jardin',      en: 'Flower garden',      es: 'El Jardín' },
  { slug: 'la-mano',        en: 'Home repair',        es: 'La Mano' },
];

// The subset of MORE_CRAFTS offered as tags at signup (kept short on purpose).
export const SIGNUP_MORE_CRAFTS: CraftOption[] = MORE_CRAFTS.filter((c) =>
  (['el-huerto', 'el-invernadero', 'el-rebano', 'la-mesa', 'el-jabon', 'el-candelero', 'la-escuela', 'el-tractor'] as CraftSlug[]).includes(c.slug)
);

export const CRAFT_NAMES: Record<CraftSlug, Bilingual> = Object.fromEntries(
  [...ILLUSTRATED_CRAFTS, ...MORE_CRAFTS].map((c) => [c.slug, { en: c.en, es: c.es }])
) as Record<CraftSlug, Bilingual>;

/** Friendly label for a craft slug; falls back to the raw slug for unknown values. */
export const craftLabel = (slug: string, locale: 'en' | 'es'): string =>
  (CRAFT_NAMES as Record<string, Bilingual | undefined>)[slug]?.[locale] ?? slug;
