// src/lib/dates.ts
// Date helpers shared across pages.
//
// Gatherings happen in Central Texas, so every gathering time is entered,
// stored and displayed in CHAPTER_TZ — not the viewer's browser timezone. A
// host on a trip, a member reading from another state, and the Edge Function
// that emails them (which runs in UTC) all see the same wall-clock time.
//
//  - localeTag        BCP-47 tag for Intl formatting (was inlined everywhere)
//  - todayLocalISO    'YYYY-MM-DD' in the viewer's zone (for `event_date` filters)
//  - zonedInputToISO  <input type="datetime-local"> value, read as Central → ISO
//  - isoToZonedInput  ISO → value for that input, in Central (admin editor prefill)
//  - formatDate/Time  Intl formatting, in Central by default

import type { Locale } from '@/lib/types';

export const CHAPTER_TZ = 'America/Chicago';

export const localeTag = (locale: Locale): 'es-MX' | 'en-US' =>
  locale === 'es' ? 'es-MX' : 'en-US';

const pad2 = (n: number) => String(n).padStart(2, '0');

/** Local calendar date as 'YYYY-MM-DD' (matches the `event_date` column). */
export const todayLocalISO = (d: Date = new Date()): string =>
  `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;

/**
 * Parse a date-only string ('YYYY-MM-DD') as local midnight. `new Date('2026-07-12')`
 * would parse as UTC midnight and show the previous day west of Greenwich.
 */
export const fromDateOnly = (yyyyMmDd: string): Date => new Date(`${yyyyMmDd}T00:00:00`);

// --- timezone math ---------------------------------------------------------

type Parts = { y: number; m: number; d: number; h: number; mi: number; s: number };

const partsFmt = new Map<string, Intl.DateTimeFormat>();
const wallClockIn = (utcMs: number, tz: string): Parts => {
  let f = partsFmt.get(tz);
  if (!f) {
    f = new Intl.DateTimeFormat('en-US', {
      timeZone: tz, hour12: false,
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
    });
    partsFmt.set(tz, f);
  }
  const get = (parts: Intl.DateTimeFormatPart[], t: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((p) => p.type === t)?.value ?? 0);
  const p = f.formatToParts(new Date(utcMs));
  // Some engines render midnight as "24" with hour12:false.
  return { y: get(p, 'year'), m: get(p, 'month'), d: get(p, 'day'), h: get(p, 'hour') % 24, mi: get(p, 'minute'), s: get(p, 'second') };
};

/** Minutes east of UTC for `tz` at the given instant (CDT → -300, CST → -360). */
const offsetMinutes = (utcMs: number, tz: string): number => {
  const w = wallClockIn(utcMs, tz);
  const asIfUtc = Date.UTC(w.y, w.m - 1, w.d, w.h, w.mi, w.s);
  return Math.round((asIfUtc - utcMs) / 60000);
};

/** The instant at which the wall clock in `tz` reads y-m-d h:mi. */
export const zonedToDate = (
  y: number, m: number, d: number, h: number, mi: number, tz: string = CHAPTER_TZ
): Date => {
  const guess = Date.UTC(y, m - 1, d, h, mi);
  let utc = guess - offsetMinutes(guess, tz) * 60000;
  // Re-check with the offset that applies at the answer — differs only when
  // the guess straddles a DST change.
  const off2 = offsetMinutes(utc, tz);
  if (off2 !== offsetMinutes(guess, tz)) utc = guess - off2 * 60000;
  return new Date(utc);
};

/**
 * Value of an <input type="datetime-local"> ('YYYY-MM-DDTHH:mm'), interpreted
 * in Central Time → ISO string for the `held_at` column. Returns null when
 * the input is empty or malformed.
 */
export const zonedInputToISO = (input: string, tz: string = CHAPTER_TZ): string | null => {
  const m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/.exec(input);
  if (!m) return null;
  const [, y, mo, d, h, mi] = m.map(Number);
  const date = zonedToDate(y, mo, d, h, mi, tz);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
};

/** ISO timestamp → 'YYYY-MM-DDTHH:mm' in Central Time, for prefilling that input. */
export const isoToZonedInput = (iso: string, tz: string = CHAPTER_TZ): string => {
  const w = wallClockIn(new Date(iso).getTime(), tz);
  return `${w.y}-${pad2(w.m)}-${pad2(w.d)}T${pad2(w.h)}:${pad2(w.mi)}`;
};

/** ISO timestamp → 'YYYY-MM-DD' of that instant in Central Time. */
export const dateOnlyInZone = (iso: string, tz: string = CHAPTER_TZ): string => {
  const w = wallClockIn(new Date(iso).getTime(), tz);
  return `${w.y}-${pad2(w.m)}-${pad2(w.d)}`;
};

// --- formatting -------------------------------------------------------------

export const formatDate = (
  value: string | Date,
  locale: Locale,
  opts: Intl.DateTimeFormatOptions = { month: 'long', day: 'numeric', year: 'numeric' }
): string => {
  const d = typeof value === 'string' ? new Date(value) : value;
  return d.toLocaleDateString(localeTag(locale), { timeZone: CHAPTER_TZ, ...opts });
};

export const formatTime = (
  value: string | Date,
  locale: Locale,
  opts: Intl.DateTimeFormatOptions = { hour: 'numeric', minute: '2-digit' }
): string => {
  const d = typeof value === 'string' ? new Date(value) : value;
  return d.toLocaleTimeString(localeTag(locale), { timeZone: CHAPTER_TZ, ...opts });
};

export const formatDateTime = (
  value: string | Date,
  locale: Locale,
  opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }
): string => {
  const d = typeof value === 'string' ? new Date(value) : value;
  return d.toLocaleString(localeTag(locale), { timeZone: CHAPTER_TZ, ...opts });
};

/** Short zone label for the UI, e.g. "CDT" / "CST" (falls back to "CT"). */
export const chapterTzLabel = (locale: Locale, at: Date = new Date()): string => {
  const part = new Intl.DateTimeFormat(localeTag(locale), { timeZone: CHAPTER_TZ, timeZoneName: 'short' })
    .formatToParts(at)
    .find((p) => p.type === 'timeZoneName')?.value;
  return part && !/GMT|UTC/.test(part) ? part : 'CT';
};
