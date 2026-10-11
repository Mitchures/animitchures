import { Favorite, airingThisWeek, collectionStats, sortedByTitle, studioOf } from './derive';
import featured from '../../../e2e/fixtures/Featured.json';

// The favourites fixture carries only titles and covers (it predates the wider
// query), so the figures are checked against the home fixture's top bucket,
// which has every field the list now asks for.
const top = (featured as unknown as { data: { top: { media: Favorite[] } } }).data.top.media;

test('counts the collection: titles, episodes, hours, mean, leading genre, oldest', () => {
  const stats = collectionStats(top);
  expect(stats.count).toBe(15);
  expect(stats.episodes).toBe(top.reduce((n, m) => n + (m.episodes ?? 0), 0));
  expect(stats.meanScore).toBe(90);
  expect(stats.topGenre).toEqual({ genre: 'Drama', count: 11 });
  expect(stats.oldest?.year).toBe(2009);
  expect(stats.oldest?.title).toBe('Fullmetal Alchemist: Brotherhood');
});

test('an empty collection has no mean, no genre and no oldest rather than zeros', () => {
  expect(collectionStats([])).toEqual({
    count: 0,
    episodes: 0,
    hours: 0,
    meanScore: null,
    topGenre: null,
    oldest: null,
  });
});

test('next up is the favourites airing inside seven days, soonest first', () => {
  const now = 1788616800 - 3600; // an hour before BLEACH's fixture episode
  const airing = airingThisWeek(top, now);
  expect(airing.map((m) => m.title.userPreferred)).toEqual([
    'BLEACH: Sennen Kessen-hen - Kashin-tan',
    'Re:Zero kara Hajimeru Isekai Seikatsu 4th Season',
  ]);
  // A week on, both have aired and nothing else is scheduled.
  expect(airingThisWeek(top, now + 8 * 86400)).toEqual([]);
});

test('the shelf is A to Z by the printed title, without touching the input', () => {
  const input = [...top];
  const shelf = sortedByTitle(input);
  expect(shelf[0].title.english ?? shelf[0].title.userPreferred).toBe(
    'Attack on Titan Season 3 Part 2',
  );
  expect(input).toEqual(top);
});

test('the studio is the main one, or the first listed', () => {
  expect(studioOf(top[0])).toBe('MADHOUSE');
});
