import { describe, expect, test } from 'vitest';

import { featuredVariables } from './featured';

/** Fixed instants, so these never depend on when the suite runs. */
const at = (iso: string) => new Date(`${iso}T12:00:00Z`);

describe('featuredVariables', () => {
  test('reads the current season from the month', () => {
    expect(featuredVariables(false, at('2026-04-10'))).toMatchObject({
      season: 'SPRING',
      seasonYear: 2026,
    });
    expect(featuredVariables(false, at('2026-07-01'))).toMatchObject({
      season: 'SUMMER',
      seasonYear: 2026,
    });
  });

  test('wraps FALL round to WINTER of the following year', () => {
    // The bug this replaces: `index < SEASONS.length - 1` made FALL — the last
    // entry — have no next season at all, so September through November sent
    // `season: null` and the Upcoming rail showed arbitrary popular anime.
    expect(featuredVariables(false, at('2026-09-13'))).toMatchObject({
      season: 'FALL',
      seasonYear: 2026,
      nextSeason: 'WINTER',
      nextYear: 2027,
    });
  });

  test('every month has a next season', () => {
    for (let month = 1; month <= 12; month += 1) {
      const vars = featuredVariables(false, at(`2026-${String(month).padStart(2, '0')}-15`));
      expect(vars.season).toBeTruthy();
      expect(vars.nextSeason).toBeTruthy();
      expect(vars.nextSeason).not.toBe(vars.season);
    }
  });

  test('December belongs to the WINTER that AniList labels with the next year', () => {
    // AniList's WINTER 2027 is the Dec 2026 - Feb 2027 window, so a December
    // viewer is already inside WINTER 2027 and the season after it is SPRING.
    expect(featuredVariables(false, at('2026-12-20'))).toMatchObject({
      season: 'WINTER',
      seasonYear: 2027,
      nextSeason: 'SPRING',
      nextYear: 2027,
    });
  });

  test('January stays in the same WINTER as the December before it', () => {
    expect(featuredVariables(false, at('2027-01-05'))).toMatchObject({
      season: 'WINTER',
      seasonYear: 2027,
      nextSeason: 'SPRING',
      nextYear: 2027,
    });
  });

  test('carries isAdult through', () => {
    expect(featuredVariables(true, at('2026-09-13')).isAdult).toBe(true);
    expect(featuredVariables(false, at('2026-09-13')).isAdult).toBe(false);
  });

  test('is stable for one instant, so Discover and AuthShell share a cache entry', () => {
    // Both callers must produce byte-identical variables or Apollo keys them
    // separately and the sign-in path fetches 173 KB of Featured twice.
    const now = at('2026-09-13');
    expect(featuredVariables(false, now)).toEqual(featuredVariables(false, now));
  });
});
