// Liturgical season per calendar month.
// NOTE: The liturgical calendar does not align cleanly to calendar months —
// Lent and Easter move each year, and Advent crosses into December. This
// month-granular approximation is intentional for year-one simplicity;
// when we have proper liturgical date math we can compute season by day.

import type { Bilingual } from '@/lib/types';

export type LiturgicalSeason = 'advent' | 'christmas' | 'ordinary' | 'lent' | 'easter';

export const seasonByMonth: Record<number, LiturgicalSeason> = {
  0: 'christmas',  // January
  1: 'ordinary',   // February
  2: 'lent',       // March
  3: 'easter',     // April
  4: 'easter',     // May
  5: 'ordinary',   // June
  6: 'ordinary',   // July
  7: 'ordinary',   // August
  8: 'ordinary',   // September
  9: 'ordinary',   // October
  10: 'ordinary',  // November
  11: 'advent',    // December
};

export const seasonMeta: Record<LiturgicalSeason, {
  fill: string;
  stroke: string;
  label: Bilingual;
}> = {
  advent:    { fill: 'rgba(43,72,114,0.10)',  stroke: 'rgba(43,72,114,0.25)',  label: { es: 'Adviento',          en: 'Advent' } },
  christmas: { fill: 'rgba(198,139,62,0.10)', stroke: 'rgba(198,139,62,0.25)', label: { es: 'Navidad',           en: 'Christmas' } },
  ordinary:  { fill: 'rgba(62,79,47,0.06)',   stroke: 'rgba(62,79,47,0.15)',   label: { es: 'Tiempo Ordinario',  en: 'Ordinary Time' } },
  lent:      { fill: 'rgba(122,30,30,0.08)',  stroke: 'rgba(122,30,30,0.20)',  label: { es: 'Cuaresma',          en: 'Lent' } },
  easter:    { fill: 'rgba(239,230,210,0.70)',stroke: 'rgba(198,139,62,0.30)', label: { es: 'Pascua',            en: 'Easter' } },
};
