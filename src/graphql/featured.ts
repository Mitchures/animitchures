/**
 * What the Featured query actually returns, as the Discover sections read it.
 *
 * Not the generated `Media`: that type is fully `Maybe<>`-wrapped because it
 * describes every field AniList *could* return for any query, so using it here
 * would mean a null check on `title` and `coverImage` — fields the Featured
 * query always selects and AniList always fills. These components were typed
 * `any` to dodge that, which gave up checking altogether.
 *
 * Fields are optional here only where AniList genuinely omits them: a title
 * that has not aired has no score, most have no banner art, and a premiere date
 * is often a month with no day.
 */
export interface FeaturedMedia {
  id: number;
  title: {
    userPreferred: string;
    english?: string | null;
    romaji?: string | null;
  };
  coverImage: {
    large?: string | null;
    extraLarge?: string | null;
  };
  bannerImage?: string | null;
  genres?: string[] | null;
  format?: string | null;
  season?: string | null;
  averageScore?: number | null;
  popularity?: number | null;
  episodes?: number | null;
  duration?: number | null;
  startDate?: {
    year?: number | null;
    month?: number | null;
    day?: number | null;
  } | null;
  studios?: {
    edges?: { isMain?: boolean | null; node?: { name?: string } | null }[] | null;
  } | null;
  nextAiringEpisode?: {
    airingAt: number;
    episode: number;
    timeUntilAiring: number;
  } | null;
}

/** One bucket of the query — trending, season, nextSeason, popular, top. */
export interface FeaturedBucket {
  media: FeaturedMedia[];
}

/** The whole payload, keyed by bucket name. */
export type Featured = Record<string, FeaturedBucket | undefined>;
