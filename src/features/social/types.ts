export interface SocialUser {
  id: number;
  name: string;
  avatar: { large: string } | null;
}

export interface FeedActivity {
  id: number;
  type: string;
  createdAt: number;
  likeCount: number;
  replyCount: number;
  user: SocialUser | null;
  /** ListActivity only. */
  status?: string | null;
  progress?: string | null;
  media?: {
    id: number;
    isAdult: boolean | null;
    title: { userPreferred: string };
    coverImage: { large: string };
    episodes: number | null;
  } | null;
  /** TextActivity only. */
  text?: string | null;
}

/** What an activity actually announces, once its status is read. */
export type Milestone = 'completed' | 'started' | 'dropped' | 'paused' | 'rewatched' | null;
