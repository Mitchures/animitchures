/**
 * What the AnilistUserAndActivity query returns, as this page reads it.
 *
 * Hand-written for the same reason as graphql/featured: the generated `User`
 * wraps every field in `Maybe<>` because it describes everything AniList could
 * return for any query.
 */
export interface ActivityDay {
  date: number;
  amount: number;
  level: number;
}

export interface GenreStat {
  genre: string;
  count: number;
}

export interface AnimeStatistics {
  count?: number | null;
  meanScore?: number | null;
  standardDeviation?: number | null;
  minutesWatched?: number | null;
  episodesWatched?: number | null;
  genrePreview?: GenreStat[] | null;
}

export interface FavouriteMedia {
  id: number;
  title: { userPreferred: string };
  coverImage?: { large?: string | null } | null;
}

export interface ListActivity {
  id: number;
  status?: string | null;
  progress?: string | null;
  createdAt: number;
  media?: {
    id: number;
    title: { userPreferred: string };
    coverImage?: { large?: string | null } | null;
  } | null;
}

export interface AnilistProfile {
  id: number;
  name: string;
  avatar?: { large?: string | null } | null;
  bannerImage?: string | null;
  about?: string | null;
  createdAt?: number | null;
  statistics?: { anime?: AnimeStatistics | null } | null;
  stats?: { activityHistory?: ActivityDay[] | null } | null;
  favourites?: { anime?: { edges?: { node: FavouriteMedia }[] | null } | null } | null;
}
