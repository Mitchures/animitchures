/** What the Taste page reads. Hand-written; the generated types are all Maybe. */

export interface Bucket {
  count: number;
}

export interface ScoreBucket extends Bucket {
  score: number;
}
export interface StudioBucket extends Bucket {
  meanScore: number;
  studio: { id: number; name: string };
}
export interface VoiceBucket extends Bucket {
  voiceActor: { id: number; name: { full: string }; image: { large: string } };
}
export interface TagBucket extends Bucket {
  tag: { id: number; name: string };
}
export interface YearBucket extends Bucket {
  releaseYear: number;
}
export interface FormatBucket extends Bucket {
  format: string;
}
export interface CountryBucket extends Bucket {
  country: string;
}
export interface LengthBucket extends Bucket {
  length: string | null;
}

export interface AnimeStatistics {
  count: number;
  meanScore: number;
  standardDeviation: number;
  minutesWatched: number;
  episodesWatched: number;
  scores: ScoreBucket[];
  studios: StudioBucket[];
  voiceActors: VoiceBucket[];
  tags: TagBucket[];
  releaseYears: YearBucket[];
  formats: FormatBucket[];
  countries: CountryBucket[];
  lengths: LengthBucket[];
}

export interface TasteUser {
  id: number;
  name: string;
  mediaListOptions: { scoreFormat: string | null } | null;
  statistics: { anime: AnimeStatistics } | null;
}
