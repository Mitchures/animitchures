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

/** AniList's seasons, in the order they occur. */
const SEASONS = ['WINTER', 'SPRING', 'SUMMER', 'FALL'] as const;

export type Season = (typeof SEASONS)[number];

/**
 * AniList labels the December-February window WINTER of the *later* year, which
 * is why 12 sits with 1 and 2 rather than with the autumn months around it.
 */
const SEASON_BY_MONTH: Record<number, Season> = {
  12: 'WINTER',
  1: 'WINTER',
  2: 'WINTER',
  3: 'SPRING',
  4: 'SPRING',
  5: 'SPRING',
  6: 'SUMMER',
  7: 'SUMMER',
  8: 'SUMMER',
  9: 'FALL',
  10: 'FALL',
  11: 'FALL',
};

export interface FeaturedVariables {
  season: Season;
  seasonYear: number;
  nextSeason: Season;
  nextYear: number;
  isAdult: boolean;
}

/**
 * The variables for `FEATURED_QUERY`, computed in one place.
 *
 * Shared by Discover and AuthShell, and that sharing is the point. AuthShell ran
 * the same query with *no* variables, on the theory that Apollo caches by query
 * so reaching Discover afterwards would be free. Apollo caches by query **and
 * variables**, so the sign-in path actually fetched Featured twice — 173 KB
 * each, against a budget of 30 requests a minute. Identical variables collapse
 * that to one.
 *
 * It also fixes the season maths. The previous `getNextSeason` walked the season
 * list with `index < SEASONS.length - 1`, so FALL — the last entry — had no next
 * season and returned `undefined`. From September to November the Upcoming rail
 * therefore asked for `season: null` and showed whatever was popular instead.
 * The year was wrong in the same window: `nextYear` only rolled over after
 * September, but the season following FALL is always the next year's WINTER.
 *
 * `now` is injectable so the season boundaries can be tested at fixed instants.
 */
export const featuredVariables = (isAdult: boolean, now: Date = new Date()): FeaturedVariables => {
  const month = now.getMonth() + 1;
  const season = SEASON_BY_MONTH[month];
  // A December viewer is already inside the WINTER AniList numbers as next year.
  const seasonYear = month === 12 ? now.getFullYear() + 1 : now.getFullYear();

  const nextSeason = SEASONS[(SEASONS.indexOf(season) + 1) % SEASONS.length];
  // Only the wrap back round to WINTER crosses a year boundary.
  const nextYear = nextSeason === 'WINTER' ? seasonYear + 1 : seasonYear;

  return { season, seasonYear, nextSeason, nextYear, isAdult };
};
