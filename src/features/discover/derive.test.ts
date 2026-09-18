import fixture from '../../../e2e/fixtures/Featured.json';
import {
  airingWithin,
  airingTonight,
  topRated,
  seasonCountdown,
  greeting,
  weekDots,
  whenLabel,
  highestRatedAiringFavorite,
  genreCounts,
  uniqueMedia,
  seasonWeeks,
  comingLater,
  allTimePopular,
  compactCount,
} from './derive';
import { Featured } from 'graphql/featured';
import { GENRE_TILES } from 'helpers';

const featured = fixture.data as unknown as Featured;
/** Sat 5 Sep 2026 19:17 JST — when the fixture was captured. */
const NOW = 1788603464;
const WEEK = 7 * 86400;

test('14 unique titles air within the week, Bleach first', () => {
  const week = airingWithin(featured, NOW, WEEK);

  expect(week).toHaveLength(14);
  expect(week[0].title.english).toBe('BLEACH: Thousand-Year Blood War - The Calamity');
  expect(week[0].nextAiringEpisode.episode).toBe(7);
});

test('tonight means before the next local midnight', () => {
  const tonight = airingTonight(featured, new Date(NOW * 1000));

  expect(tonight.map((m) => m.nextAiringEpisode.episode)).toEqual([7, 22]);
});

test('top rated is the first of the top bucket', () => {
  expect(topRated(featured)?.averageScore).toBe(91);
});

test('the season countdown finds the earliest premiere and the bucket size', () => {
  const season = seasonCountdown(featured, NOW)!;

  // By date, not by the bucket's popularity order: the bucket's first entry is
  // Apothecary Diaries S3, which premieres eight days after this one.
  expect(season.days).toBe(19);
  expect(season.first?.title.english).toBe(
    "STEEL BALL RUN JoJo's Bizarre Adventure 2nd - 3rd STAGE",
  );
  expect(season.count).toBe(15);
});

test('greeting follows the hour and falls back to Discover without a name', () => {
  expect(greeting(new Date(2026, 8, 5, 19), 'Mitchell')).toBe('Good evening, Mitchell');
  expect(greeting(new Date(2026, 8, 5, 9), 'Mitchell')).toBe('Good morning, Mitchell');
  expect(greeting(new Date(2026, 8, 5, 14), null)).toBe('Discover');
});

test('week dots give eight columns starting today with one colour per episode', () => {
  const dots = weekDots(airingWithin(featured, NOW, WEEK), NOW);

  expect(dots).toHaveLength(8);
  expect(dots[0].isToday).toBe(true);
  expect(dots.map((d) => d.colors.length)).toEqual([2, 1, 1, 0, 1, 1, 7, 1]);
  // Bleach has no cover colour in the fixture, so the dot falls back to grey.
  expect(dots[0].colors).toEqual(['#c9c9cd', '#e49335']);
});

test('highest-rated airing favourite prefers score among the favourites that are airing', () => {
  expect(highestRatedAiringFavorite(featured, [189046, 21])?.id).toBe(189046);
  expect(highestRatedAiringFavorite(featured, [])).toBeUndefined();
});

test('whenLabel says Tonight for today and names the weekday otherwise', () => {
  const now = new Date(NOW * 1000);

  // Bleach, tonight at 11pm JST.
  expect(whenLabel(1788616800, now)).toBe('Tonight, 11:00 pm');
  // Re:ZERO, the following Wednesday at 10pm JST.
  expect(whenLabel(1788958800, now)).toBe('Wed, 10:00 pm');
});

test('genre counts run across every bucket, ties broken alphabetically', () => {
  const genres = genreCounts(featured);

  expect(genres).toHaveLength(8);
  // Action and Drama both cover 40 of the 65 titles, so the tie is broken by
  // name rather than by whichever the Map happened to see first.
  expect(genres.slice(0, 4)).toEqual([
    { genre: 'Action', count: 40 },
    { genre: 'Drama', count: 40 },
    { genre: 'Fantasy', count: 29 },
    { genre: 'Adventure', count: 28 },
  ]);
  expect(genres.map((g) => g.count)).toEqual([...genres.map((g) => g.count)].sort((a, b) => b - a));
});

test('every genre in the response has a tile identity', () => {
  const all = new Set(uniqueMedia(featured).flatMap((m) => m.genres ?? []));

  for (const genre of all) {
    expect(GENRE_TILES[genre], `${genre} has no palette`).toBeDefined();
  }
});

test('season premieres group into Monday-start weeks, keeping the empty ones', () => {
  const { weeks, undated } = seasonWeeks(featured, NOW);

  // Sep 21 through Dec 7 inclusive, every week in between kept. It starts at
  // the first premiere rather than today — nothing premieres for three weeks,
  // and opening the row with three empty cards would be absurd.
  expect(weeks).toHaveLength(12);
  expect(weeks.map((w) => w.premieres.length)).toEqual([1, 5, 2, 1, 1, 0, 0, 0, 1, 0, 0, 1]);
  // The silence after Oct 23 is three empty weeks, not one missing one.
  expect(weeks.slice(5, 8).every((w) => w.premieres.length === 0)).toBe(true);
  expect(undated.map((m) => m.title.english)).toEqual([
    'Black Clover Season 2',
    'Cyberpunk: Edgerunners 2',
    "A Returner's Magic Should be Special Season 2",
  ]);
});

test('the week card names its lead and computes its weekdays', () => {
  const { weeks } = seasonWeeks(featured, NOW);
  const busiest = weeks.find((w) => w.premieres.length === 5)!;

  // Apothecary Diaries leads on popularity, not on air order.
  expect(busiest.lede).toBe('The Apothecary Diaries Season 3 leads, Thursday to Sunday');
  // Seven Monday-to-Sunday slots; this week fills Thursday through Sunday.
  expect(busiest.days.map((d) => d.length)).toEqual([0, 0, 0, 2, 1, 1, 1]);

  const single = weeks.find((w) => w.premieres.length === 1)!;
  expect(single.lede).toBe("STEEL BALL RUN JoJo's Bizarre Adventure 2nd - 3rd STAGE, Friday");
});

test('titles with no English name still print', () => {
  const { weeks } = seasonWeeks(featured, NOW);
  const ledes = weeks.filter((w) => w.premieres.length).map((w) => w.lede);

  expect(ledes.every((l) => l && !l.includes('undefined'))).toBe(true);
});

test('coming later leads on how many people are waiting, not on query order', () => {
  const { lead, rest, total } = comingLater(featured);

  // AniList returns the next-season bucket by its own order; this sorts it.
  expect(lead?.title.english).toBe('JUJUTSU KAISEN Season 3: The Culling Game Part 1');
  expect(rest.map((m) => m.popularity)).toEqual([222753, 222234, 171999]);
  // `total` is the whole bucket, not the four on screen — the heading counts it.
  expect(total).toBe(15);
  expect(rest).toHaveLength(3);
});

test('coming later survives an empty bucket', () => {
  const { lead, rest, total } = comingLater(null);

  expect(lead).toBeUndefined();
  expect(rest).toEqual([]);
  expect(total).toBe(0);
});

test('the coming-later runners-up are not the lead again', () => {
  const { lead, rest } = comingLater(featured);

  expect(rest.map((m) => m.id)).not.toContain(lead?.id);
});

test('all-time popular keeps the query order, most-listed first', () => {
  const popular = allTimePopular(featured);

  expect(popular).toHaveLength(6);
  expect(popular[0].title.english).toBe('Attack on Titan');
  expect(popular.map((m) => m.popularity)).toEqual([
    1050648, 990926, 968617, 958162, 871370, 838114,
  ]);
});

test('the popular matrix separates the leaders it is meant to compare', () => {
  // One dot per 25,000 members across 42 slots. Scaled from zero instead, these
  // six all read 80–100 per cent and the block would say nothing.
  const dots = allTimePopular(featured).map((m) =>
    Math.min(42, Math.round((m.popularity ?? 0) / 25_000)),
  );

  expect(dots).toEqual([42, 40, 39, 38, 35, 34]);
});

test('compact counts round to the unit the label uses', () => {
  expect(compactCount(1_050_648)).toBe('1.05M');
  expect(compactCount(838_114)).toBe('838K');
  expect(compactCount(1_000)).toBe('1K');
  expect(compactCount(999)).toBe('999');
  expect(compactCount(0)).toBe('0');
});
