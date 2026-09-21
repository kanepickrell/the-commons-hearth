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
