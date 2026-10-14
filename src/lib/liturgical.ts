// src/lib/liturgical.ts
// Liturgical date math for the Roman Rite (Ordinary Form) as observed in the
// United States.
//
// This replaces the month-granular approximation that seasons.ts carried in
// year one ("March is Lent"). Lent now begins on Ash Wednesday, Easter moves
// with the paschal full moon, and Advent starts on its own Sunday. seasons.ts
// keeps the labels and the palette; the dates live here.
//
// Everything works in LOCAL CIVIL DATES at midnight. The chapter's year is a
// calendar of days, not instants, so there is deliberately no timezone math in
// this file — compare dates with `dayNumber`, never with `getTime()`, so a DST
// boundary can't shift a feast by a day.

import type { LiturgicalSeason } from '@/lib/fixtures/seasons';
import { feasts, type Feast } from '@/lib/fixtures/feasts';

// --- day arithmetic --------------------------------------------------------

/** Local civil midnight. Month is 0-indexed, matching Date and our fixtures. */
export const civil = (y: number, m: number, d: number): Date => new Date(y, m, d);

/**
 * Integer day index for a civil date, built from its Y/M/D in UTC so the
 * result is immune to DST. Two dates are the same day iff their day numbers
 * match, and `b - a` is an exact day count.
 */
export const dayNumber = (d: Date): number =>
  Math.floor(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 86_400_000);

export const addDays = (d: Date, n: number): Date =>
  civil(d.getFullYear(), d.getMonth(), d.getDate() + n);

export const sameDay = (a: Date, b: Date): boolean => dayNumber(a) === dayNumber(b);

/** Whole days from `a` to `b`; negative when `b` is earlier. */
export const daysBetween = (a: Date, b: Date): number => dayNumber(b) - dayNumber(a);

const daysInMonth = (y: number, m: number): number => new Date(y, m + 1, 0).getDate();

// --- the moveable feasts ---------------------------------------------------

/**
 * Easter Sunday (Gregorian), by the Meeus/Jones/Butcher algorithm. Every other
 * moveable date in the year is an offset from this one.
 */
export const easterSunday = (year: number): Date => {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const n = h + l - 7 * m + 114;
  return civil(year, Math.floor(n / 31) - 1, (n % 31) + 1);
};

/** Ash Wednesday — 46 days before Easter (40 fast days plus six Sundays). */
export const ashWednesday = (year: number): Date => addDays(easterSunday(year), -46);

/** Pentecost — the fiftieth day, which closes the Easter season. */
export const pentecost = (year: number): Date => addDays(easterSunday(year), 49);

/**
 * The Baptism of the Lord, which closes Christmastide. In the United States
 * Epiphany is transferred to the Sunday between Jan 2 and Jan 8; the Baptism
 * is the Sunday after — or, when Epiphany itself falls that late (Jan 7 or 8),
 * the Monday immediately following.
 */
export const baptismOfTheLord = (year: number): Date => {
  const jan2 = civil(year, 0, 2);
  const epiphany = addDays(jan2, (7 - jan2.getDay()) % 7); // first Sunday on/after Jan 2
  return epiphany.getDate() >= 7 ? addDays(epiphany, 1) : addDays(epiphany, 7);
};

/**
 * The First Sunday of Advent — the fourth Sunday before Christmas Day, i.e.
 * three weeks before the last Sunday that falls on or before Dec 24.
 */
export const adventSunday = (year: number): Date => {
  const dec24 = civil(year, 11, 24);
  const adventIV = addDays(dec24, -dec24.getDay()); // Sunday on/before Dec 24
  return addDays(adventIV, -21);
};

// --- seasons ---------------------------------------------------------------

/** The liturgical season a given civil date falls in. Total over all dates. */
export const seasonOn = (date: Date): LiturgicalSeason => {
  const y = date.getFullYear();
  const n = dayNumber(date);

  if (n <= dayNumber(baptismOfTheLord(y))) return 'christmas';
  if (n < dayNumber(ashWednesday(y))) return 'ordinary';
  if (n < dayNumber(easterSunday(y))) return 'lent';
  if (n <= dayNumber(pentecost(y))) return 'easter';
  if (n < dayNumber(adventSunday(y))) return 'ordinary';
  if (n <= dayNumber(civil(y, 11, 24))) return 'advent';
  return 'christmas';
};

export type SeasonRange = {
  season: LiturgicalSeason;
  start: Date;
  /** Inclusive — the last day that belongs to this stretch. */
  end: Date;
};

/**
 * The civil year carved into its liturgical stretches, in calendar order and
 * covering every day from Jan 1 to Dec 31. Christmas appears twice — the tail
 * of last year's and the head of this one's — which is correct for a wheel:
 * they are two different arcs.
 */
export const seasonRanges = (year: number): SeasonRange[] => {
  const baptism = baptismOfTheLord(year);
  const ash = ashWednesday(year);
  const easter = easterSunday(year);
  const pent = pentecost(year);
  const advent = adventSunday(year);

  return [
    { season: 'christmas', start: civil(year, 0, 1), end: baptism },
    { season: 'ordinary', start: addDays(baptism, 1), end: addDays(ash, -1) },
    { season: 'lent', start: ash, end: addDays(easter, -1) },
    { season: 'easter', start: easter, end: pent },
    { season: 'ordinary', start: addDays(pent, 1), end: addDays(advent, -1) },
    { season: 'advent', start: advent, end: civil(year, 11, 24) },
    { season: 'christmas', start: civil(year, 11, 25), end: civil(year, 11, 31) },
  ];
};

/**
 * The season that owns the most days of a calendar month — what to call a
 * month when only one word fits. April 2026 is both Lent and Easter; most of
 * it is Easter, so "Easter" is the honest single label.
 */
export const dominantSeasonOfMonth = (year: number, month: number): LiturgicalSeason => {
  const tally = new Map<LiturgicalSeason, number>();
  const last = daysInMonth(year, month);
  for (let d = 1; d <= last; d++) {
    const s = seasonOn(civil(year, month, d));
    tally.set(s, (tally.get(s) ?? 0) + 1);
  }
  let best: LiturgicalSeason = 'ordinary';
  let bestN = -1;
  for (const [s, n] of tally) {
    if (n > bestN) {
      best = s;
      bestN = n;
    }
  }
  return best;
};

// --- feasts ----------------------------------------------------------------

export type DatedFeast = { feast: Feast; date: Date; daysAway: number };

/** A chapter feast placed in a given civil year. */
export const feastDate = (f: Feast, year: number): Date => civil(year, f.month, f.day);

/**
 * The next feast the chapter marks, on or after `from`. Wraps into next year
 * once the last one has passed, so this never returns null while `feasts` has
 * entries. `daysAway` is 0 on the feast itself.
 */
export const nextFeast = (from: Date = new Date()): DatedFeast | null => {
  if (feasts.length === 0) return null;
  const y = from.getFullYear();
  const candidates = [
    ...feasts.map((f) => ({ feast: f, date: feastDate(f, y) })),
    ...feasts.map((f) => ({ feast: f, date: feastDate(f, y + 1) })),
  ]
    .map((c) => ({ ...c, daysAway: daysBetween(from, c.date) }))
    .filter((c) => c.daysAway >= 0)
    .sort((a, b) => a.daysAway - b.daysAway);
  return candidates[0] ?? null;
};

/** Every chapter feast falling in the given month, earliest first. */
export const feastsInMonth = (month: number): Feast[] =>
  feasts.filter((f) => f.month === month).sort((a, b) => a.day - b.day);

// --- wheel geometry helpers ------------------------------------------------

/**
 * Where a date sits on a twelve-month wheel, in degrees clockwise from the top
 * (0 = Jan 1). Day-accurate and month-length aware, so Feb 28 and Mar 1 are
 * adjacent rather than a day apart on a notional 30-day month.
 */
export const angleOfDate = (date: Date): number => {
  const y = date.getFullYear();
  const m = date.getMonth();
  const frac = (date.getDate() - 1) / daysInMonth(y, m);
  return (m + frac) * 30;
};

/** Angle just past a range's final day, so adjacent arcs meet without a gap. */
export const angleAfterDate = (date: Date): number => angleOfDate(addDays(date, 1));

// --- palette ---------------------------------------------------------------

/**
 * Season colors, as literal HSL strings matching the brand tokens in
 * index.css. Literals rather than Tailwind classes because most of these are
 * consumed as SVG fill/stroke attributes, and because a dynamic class name
 * (`text-${token}`) would never survive Tailwind's static extraction.
 *
 * This is also where --azul and --rojo finally earn their keep: Advent is the
 * Marian blue the chapter already chose for it in seasons.ts, Lent the
 * Eucharistic red.
 */
export const SEASON_COLOR: Record<LiturgicalSeason, { ink: string; rule: string }> = {
  advent: { ink: 'hsl(215 45% 31%)', rule: 'hsl(215 45% 31% / 0.35)' }, // azul
  christmas: { ink: 'hsl(32 56% 51%)', rule: 'hsl(32 56% 51% / 0.40)' }, // ocre
  ordinary: { ink: 'hsl(92 24% 25%)', rule: 'hsl(92 24% 25% / 0.30)' }, // mesquite
  lent: { ink: 'hsl(0 61% 30%)', rule: 'hsl(0 61% 30% / 0.35)' }, // rojo
  easter: { ink: 'hsl(32 56% 51%)', rule: 'hsl(32 56% 51% / 0.40)' }, // ocre
};
