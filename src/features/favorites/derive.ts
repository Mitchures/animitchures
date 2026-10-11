import { Airing, displayTitle } from 'features/discover/derive';
import { FeaturedMedia } from 'graphql/featured';

/** The same shape Discover reads, because the list query now asks for the same fields. */
export type Favorite = FeaturedMedia;

/** How long after air time an episode still counts as "on" — Discover's grace. */
const GRACE_SECONDS = 30 * 60;
const WEEK_SECONDS = 7 * 86400;

export interface CollectionStats {
  count: number;
  /** Episodes across the collection, counting a title with no figure as none. */
  episodes: number;
  /** Rounded hours, from episodes × duration; a title with no duration counts 24. */
  hours: number;
  /** Mean of the titles that have a score, or null when none does. */
  meanScore: number | null;
  /** The genre that appears on the most titles, with how many. */
  topGenre: { genre: string; count: number } | null;
  /** The earliest start year on the list and the title that carries it. */
  oldest: { year: number; title: string } | null;
}

const DEFAULT_DURATION = 24;

/**
 * The figures the page opens with. Derived rather than fetched: every field is
 * on the list response already, so the whole header costs nothing extra.
 */
export const collectionStats = (media: Favorite[]): CollectionStats => {
  const episodes = media.reduce((sum, item) => sum + (item.episodes ?? 0), 0);
  const minutes = media.reduce(
    (sum, item) => sum + (item.episodes ?? 0) * (item.duration ?? DEFAULT_DURATION),
    0,
  );
  const scored = media.filter((item) => item.averageScore != null);
  const meanScore = scored.length
    ? Math.round(scored.reduce((sum, item) => sum + (item.averageScore ?? 0), 0) / scored.length)
    : null;

  const genres = new Map<string, number>();
  media.forEach((item) =>
    (item.genres ?? []).forEach((genre) => genres.set(genre, (genres.get(genre) ?? 0) + 1)),
  );
  const [top] = [...genres.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  const topGenre = top ? { genre: top[0], count: top[1] } : null;

  const dated = media.filter((item) => item.startDate?.year != null);
  const first = dated.sort((a, b) => (a.startDate?.year ?? 0) - (b.startDate?.year ?? 0))[0];
  const oldest = first ? { year: first.startDate?.year ?? 0, title: displayTitle(first) } : null;

  return {
    count: media.length,
    episodes,
    hours: Math.round(minutes / 60),
    meanScore,
    topGenre,
    oldest,
  };
};

/** The favourites with an episode landing in the next seven days, soonest first. */
export const airingThisWeek = (media: Favorite[], nowSeconds: number): Airing[] =>
  media
    .filter(
      (item): item is Airing =>
        item.nextAiringEpisode != null &&
        item.nextAiringEpisode.airingAt > nowSeconds - GRACE_SECONDS &&
        item.nextAiringEpisode.airingAt <= nowSeconds + WEEK_SECONDS,
    )
    .sort((a, b) => a.nextAiringEpisode.airingAt - b.nextAiringEpisode.airingAt);

/**
 * A to Z by the title the page prints. A copy, not a sort in place: the array
 * is Apollo's own cache entry, and the old page cloned the whole list to avoid
 * reordering the cache from under every other reader.
 */
export const sortedByTitle = (media: Favorite[]): Favorite[] =>
  [...media].sort((a, b) => displayTitle(a).localeCompare(displayTitle(b)));

/** The main studio's name, or the first listed; what the card prints beside the year. */
export const studioOf = (media: Favorite): string | null => {
  const edges = media.studios?.edges ?? [];
  const main = edges.find((edge) => edge?.isMain) ?? edges[0];
  return main?.node?.name ?? null;
};
