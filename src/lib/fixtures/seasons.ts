// Liturgical season labels and palette.
//
// The DATES live in src/lib/liturgical.ts, which computes them properly from
// Easter — this file is just what each season is called and how it's colored.
//
// (Year one mapped one season per calendar month, with a note to replace it
// once we had real liturgical date math. We do now: seasonOn(date) and
// dominantSeasonOfMonth(year, month) replace the old seasonByMonth table.)

import type { Bilingual } from '@/lib/types';

export type LiturgicalSeason = 'advent' | 'christmas' | 'ordinary' | 'lent' | 'easter';

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
