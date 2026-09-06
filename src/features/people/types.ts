/** Shapes this feature reads. Hand-written for the same reason as featured.ts. */

export interface Named {
  full: string;
  native?: string | null;
}

export interface Img {
  large: string;
}

export interface MediaStub {
  id: number;
  title: { userPreferred: string };
  coverImage: { large: string };
  seasonYear?: number | null;
  averageScore?: number | null;
  episodes?: number | null;
}

export interface FuzzyDate {
  year: number | null;
  month: number | null;
  day: number | null;
}

export interface StaffRole {
  id: number;
  node: { id: number; name: Named; image: Img; favourites: number };
  media: MediaStub[];
}

export interface StaffEntity {
  id: number;
  name: Named;
  image: Img;
  description: string | null;
  primaryOccupations: string[] | null;
  gender: string | null;
  homeTown: string | null;
  yearsActive: number[] | null;
  favourites: number;
  dateOfBirth: FuzzyDate | null;
  characters: {
    pageInfo: { hasNextPage: boolean; currentPage: number };
    edges: StaffRole[];
  };
}

export interface CharacterAppearance {
  id: number;
  characterRole: string | null;
  node: MediaStub;
  voiceActors: { id: number; name: Named; image: Img }[];
}

export interface CharacterEntity {
  id: number;
  name: Named;
  image: Img;
  description: string | null;
  gender: string | null;
  age: string | null;
  favourites: number;
  dateOfBirth: FuzzyDate | null;
  media: {
    pageInfo: { hasNextPage: boolean; currentPage: number };
    edges: CharacterAppearance[];
  };
}

export interface StudioEntity {
  id: number;
  name: string;
  favourites: number;
  isAnimationStudio: boolean;
  media: {
    pageInfo: { hasNextPage: boolean; currentPage: number };
    nodes: (MediaStub & { season?: string | null; format?: string | null })[];
  };
}
