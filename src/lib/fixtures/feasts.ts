// Feast days the chapter marks on the wheel. Not all feasts — just the
// ones that matter to a Catholic agrarian chapter in Central Texas. The
// `month` field is zero-indexed (0 = January).

import type { Bilingual } from '@/lib/types';

export type Feast = {
  id: string;
  month: number;  // 0-indexed
  day: number;
  name: Bilingual;
  short: Bilingual;
  patronOfChapter?: boolean;
};

export const feasts: Feast[] = [
  {
    id: 'candelaria',
    month: 1,
    day: 2,
    name:  { es: 'La Candelaria',              en: 'Candlemas' },
    short: { es: 'Candelaria',                 en: 'Candlemas' },
  },
  {
    id: 'san-isidro',
    month: 4,
    day: 15,
    name:  { es: 'San Isidro Labrador',        en: 'St. Isidore the Farmer' },
    short: { es: 'San Isidro',                 en: 'St. Isidore' },
    patronOfChapter: true,
  },
  {
    id: 'asuncion',
    month: 7,
    day: 15,
    name:  { es: 'La Asunción',                en: 'The Assumption' },
    short: { es: 'Asunción',                   en: 'Assumption' },
  },
  {
    id: 'guadalupe',
    month: 11,
    day: 12,
    name:  { es: 'Nuestra Señora de Guadalupe', en: 'Our Lady of Guadalupe' },
    short: { es: 'Guadalupe',                   en: 'Guadalupe' },
  },
];
