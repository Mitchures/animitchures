import { Media, User as ALUser } from 'graphql/types';

interface IFeatured {
  [key: string]: { [key: string]: Media[] };
}

export type AnilistUser = ALUser;

export enum WatchlistFormat {
  Default = 'DEFAULT',
  Anilist = 'ANILIST',
}

export type User = {
  uid: string;
  displayName: string | null;
  photoURL: string | null;
  email: string | null;
  isAdult?: boolean;
  anilistLinked?: boolean;
  preferredWatchlist?: WatchlistFormat;
};

export type AccessToken = {
  access_token: string;
  expires_in: number;
  refresh_token: string;
  token_type: string;
};

export type State = {
  user: User | null;
  featured: IFeatured | null;
  results: Media[] | null;
  favorites: number[];
  anilist_user: AnilistUser | null;
};

export type Action =
  | {
      type: 'set_anilist_user';
      anilist_user: AnilistUser;
    }
  | {
      type: 'clear_featured';
    }
  | {
      type: 'init_favorites';
    }
  | {
      type: 'remove_from_favorites';
      favorites: number[];
    }
  | {
      type: 'add_to_favorites';
      favorites: number[];
    }
  | {
      type: 'set_favorites';
      favorites: number[];
    }
  | {
      type: 'set_results';
      results: Media[] | null;
    }
  | {
      type: 'set_featured';
      featured: IFeatured;
    }
  | {
      type: 'update_user';
      user: User;
    }
  | {
      type: 'login_user';
      user: User;
    }
  | {
      type: 'logout_user';
    }
  | {
      type: 'set_user';
      user: User | null;
    };
