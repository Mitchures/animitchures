export interface Airing {
  id: number;
  episode: number;
  airingAt: number;
  media: {
    id: number;
    isAdult: boolean | null;
    title: { userPreferred: string };
    coverImage: { large: string; medium: string };
    format: string | null;
    episodes: number | null;
    averageScore: number | null;
    popularity: number | null;
  };
}

export type CalendarView = 'week' | 'month' | 'agenda';
