import { describe, it, expect } from 'vitest';
import { todayLocalISO, fromDateOnly, localeTag } from '@/lib/dates';
import { craftLabel, CRAFT_NAMES, ILLUSTRATED_CRAFTS } from '@/lib/crafts';
import { hasIcon, iconMap } from '@/lib/icons';
import { switchLocalePath, buildPath } from '@/i18n/routes';

describe('dates', () => {
  it('formats today in local time, not UTC', () => {
    // 11:30pm local on Jan 31 — UTC would already be Feb 1 anywhere west of Greenwich.
    const d = new Date(2026, 0, 31, 23, 30);
    expect(todayLocalISO(d)).toBe('2026-01-31');
  });
  it('parses a date-only string as local midnight', () => {
    const d = fromDateOnly('2026-07-12');
    expect(d.getDate()).toBe(12);
    expect(d.getHours()).toBe(0);
  });
  it('maps locales to Intl tags', () => {
    expect(localeTag('es')).toBe('es-MX');
    expect(localeTag('en')).toBe('en-US');
  });
});

describe('crafts', () => {
  it('has a label for every illustrated craft in both languages', () => {
    for (const c of ILLUSTRATED_CRAFTS) {
      expect(CRAFT_NAMES[c.slug].en).toBeTruthy();
      expect(CRAFT_NAMES[c.slug].es).toBeTruthy();
    }
  });
  it('falls back to the slug for unknown values', () => {
    expect(craftLabel('el-huerto', 'en')).toBe('Vegetable garden');
    expect(craftLabel('not-a-craft', 'es')).toBe('not-a-craft');
  });
});

describe('icons', () => {
  it('only claims artwork for the eight illustrated crafts', () => {
    expect(Object.keys(iconMap)).toHaveLength(8);
    expect(hasIcon('las-abejas')).toBe(true);
    expect(hasIcon('el-huerto')).toBe(false); // valid enum value, no artwork
    expect(hasIcon(null)).toBe(false);
    expect(hasIcon('constructor')).toBe(false); // prototype keys don't count
  });
});

describe('routes', () => {
  it('switches a parameterised path between locales', () => {
    expect(switchLocalePath('/talleres/abc', 'en')).toBe('/workshops/abc');
    expect(switchLocalePath('/workshops/new', 'es')).toBe('/talleres/nueva');
    expect(switchLocalePath('/unknown', 'es')).toBe('/unknown');
  });
  it('builds paths with params', () => {
    expect(buildPath('memberDetail', 'es', { id: '42' })).toBe('/miembros/42');
  });
});

describe('chapter timezone', async () => {
  const { zonedInputToISO, isoToZonedInput, dateOnlyInZone, formatTime } = await import('@/lib/dates');

  it('reads the datetime-local input as Central Time (CDT)', () => {
    // 7:00 PM CDT on July 12 is 00:00 UTC on July 13.
    expect(zonedInputToISO('2026-07-12T19:00')).toBe('2026-07-13T00:00:00.000Z');
  });
  it('reads the datetime-local input as Central Time (CST)', () => {
    // 7:00 PM CST on Jan 12 is 01:00 UTC on Jan 13.
    expect(zonedInputToISO('2026-01-12T19:00')).toBe('2026-01-13T01:00:00.000Z');
  });
  it('round-trips through the admin editor prefill', () => {
    const iso = zonedInputToISO('2026-11-01T01:30')!; // the DST fall-back night
    expect(isoToZonedInput(iso)).toBe('2026-11-01T01:30');
    expect(isoToZonedInput('2026-07-13T00:00:00Z')).toBe('2026-07-12T19:00');
  });
  it('derives the calendar day in Central, not UTC', () => {
    expect(dateOnlyInZone('2026-07-13T00:00:00Z')).toBe('2026-07-12');
  });
  it('formats times in Central regardless of the test machine zone', () => {
    expect(formatTime('2026-07-13T00:00:00Z', 'en')).toMatch(/7:00\s?PM/);
  });
  it('rejects empty or malformed input', () => {
    expect(zonedInputToISO('')).toBeNull();
    expect(zonedInputToISO('yesterday')).toBeNull();
  });
});

describe('liturgical calendar', async () => {
  const L = await import('@/lib/liturgical');
  const iso = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

  it('computes Easter across the Gregorian cycle', () => {
    expect(iso(L.easterSunday(2024))).toBe('2024-03-31');
    expect(iso(L.easterSunday(2025))).toBe('2025-04-20');
    expect(iso(L.easterSunday(2026))).toBe('2026-04-05');
    expect(iso(L.easterSunday(2027))).toBe('2027-03-28');
  });

  it('derives the moveable dates from Easter', () => {
    expect(iso(L.ashWednesday(2026))).toBe('2026-02-18');
    expect(iso(L.pentecost(2026))).toBe('2026-05-24');
  });

  it('places the fixed-but-shifting boundaries', () => {
    // US practice: Epiphany on the Sunday after Jan 2, Baptism the Sunday after.
    expect(iso(L.baptismOfTheLord(2026))).toBe('2026-01-11');
    // Fourth Sunday before Christmas, including the year Christmas is a Sunday.
    expect(iso(L.adventSunday(2026))).toBe('2026-11-29');
    expect(iso(L.adventSunday(2025))).toBe('2025-11-30');
    expect(iso(L.adventSunday(2022))).toBe('2022-11-27');
  });

  it('names the season on each side of every boundary', () => {
    const on = (m: number, d: number) => L.seasonOn(L.civil(2026, m - 1, d));
    expect(on(1, 11)).toBe('christmas');   // Baptism of the Lord
    expect(on(1, 12)).toBe('ordinary');
    expect(on(2, 17)).toBe('ordinary');    // Shrove Tuesday
    expect(on(2, 18)).toBe('lent');        // Ash Wednesday
    expect(on(4, 4)).toBe('lent');         // Holy Saturday
    expect(on(4, 5)).toBe('easter');       // Easter Sunday
    expect(on(5, 24)).toBe('easter');      // Pentecost
    expect(on(5, 25)).toBe('ordinary');
    expect(on(11, 28)).toBe('ordinary');
    expect(on(11, 29)).toBe('advent');     // Advent I
    expect(on(12, 24)).toBe('advent');
    expect(on(12, 25)).toBe('christmas');
  });

  it('carves the year into contiguous ranges with no gaps', () => {
    const ranges = L.seasonRanges(2026);
    expect(iso(ranges[0].start)).toBe('2026-01-01');
    expect(iso(ranges[ranges.length - 1].end)).toBe('2026-12-31');
    for (let i = 1; i < ranges.length; i++) {
      // Each range begins the day after the previous one ends.
      expect(L.daysBetween(ranges[i - 1].end, ranges[i].start)).toBe(1);
    }
    // And every range agrees with seasonOn at its own start.
    for (const r of ranges) expect(L.seasonOn(r.start)).toBe(r.season);
  });

  it('labels a split month by the season that owns most of it', () => {
    expect(L.dominantSeasonOfMonth(2026, 2)).toBe('lent');   // March: Lent throughout
    expect(L.dominantSeasonOfMonth(2026, 3)).toBe('easter'); // April: 4 days Lent, 26 Easter
    expect(L.dominantSeasonOfMonth(2026, 6)).toBe('ordinary');
  });

  it('finds the next chapter feast, wrapping into the new year', () => {
    const autumn = L.nextFeast(L.civil(2026, 9, 14));
    expect(autumn?.feast.id).toBe('guadalupe');
    expect(autumn?.daysAway).toBe(59);
    // Standing on the feast itself counts as zero days away, not a year.
    expect(L.nextFeast(L.civil(2026, 11, 12))?.daysAway).toBe(0);
    // Past the last feast of the year, roll over to the first of the next.
    const wrapped = L.nextFeast(L.civil(2026, 11, 13));
    expect(wrapped?.feast.id).toBe('candelaria');
    expect(wrapped?.date.getFullYear()).toBe(2027);
  });

  it('places dates on the wheel by true month length', () => {
    expect(L.angleOfDate(L.civil(2026, 0, 1))).toBe(0);
    expect(L.angleOfDate(L.civil(2026, 6, 1))).toBe(180);
    // Feb 28 2026 is the last day of a 28-day month, so it sits just shy of
    // March: 30 + (27/28)*30. A notional 30-day month would have said 57.
    expect(L.angleOfDate(L.civil(2026, 1, 28))).toBeCloseTo(58.93, 2);
    expect(L.angleAfterDate(L.civil(2026, 1, 28))).toBe(60);
  });

  it('is immune to DST shifting a day', () => {
    // The US spring-forward night: a getTime()-based diff would be 23 hours.
    expect(L.daysBetween(L.civil(2026, 2, 7), L.civil(2026, 2, 9))).toBe(2);
  });
});
