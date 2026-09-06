/**
 * The parts of an AniList list collection this feature reads.
 *
 * Hand-written for the same reason `graphql/featured.ts` is: the generated
 * `MediaList` is fully `Maybe<>`-wrapped, so every field access downstream
 * needs a guard for a null the API does not actually return here.
 */

export type ListStatus = 'CURRENT' | 'PLANNING' | 'COMPLETED' | 'DROPPED' | 'PAUSED' | 'REPEATING';

/** AniList's per-account score scale. Governs how a score is written out. */
export type ScoreFormat = 'POINT_100' | 'POINT_10_DECIMAL' | 'POINT_10' | 'POINT_5' | 'POINT_3';

export interface EntryMedia {
  id: number;
  title: { userPreferred: string };
  coverImage: { large: string; extraLarge?: string | null };
  episodes: number | null;
  format: string | null;
  status: string | null;
  averageScore: number | null;
  genres: string[] | null;
  nextAiringEpisode: { episode: number; airingAt: number } | null;
}

export interface WatchlistEntry {
  id: number;
  mediaId: number;
  status: ListStatus;
  score: number;
  progress: number;
  repeat: number;
  notes: string | null;
  updatedAt: number | null;
  media: EntryMedia;
}

export interface WatchlistGroup {
  status: ListStatus;
  label: string;
  entries: WatchlistEntry[];
}
