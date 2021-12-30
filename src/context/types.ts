interface IData {
  [key: string]: any;
}

interface IMedia {
  media: IData[];
}

interface IFeatured {
  [key: string]: IMedia;
}

export type IUser = {
  uid: string | null;
  displayName: string | null;
  photoURL: string | null;
  email: string | null;
  isAdult?: boolean;
  anilistLinked?: boolean;
};

export type AccessToken = {
  access_token: string;
  expires_in: number;
  refresh_token: string;
  token_type: string;
};

export type State = {
  user: IUser | null;
  selected: IData | null;
  featured: IFeatured | null;
  results: IData | null;
  watchlist: IData[];
  anilist_account: any;
};

export type Action =
  | {
      type: 'set_anilist_account';
      anilist_account: any;
    }
  | {
      type: 'clear_featured';
    }
  | {
      type: 'init_watchlist';
    }
  | {
      type: 'remove_from_watchlist';
      watchlist: IData[];
    }
  | {
      type: 'add_to_watchlist';
      watchlist: IData[];
    }
  | {
      type: 'set_watchlist';
      watchlist: IData[];
    }
  | {
      type: 'set_results';
      results: IData | null;
    }
  | {
      type: 'set_featured';
      featured: IFeatured;
    }
  | {
      type: 'set_selected';
      selected: IData | null;
    }
  | {
      type: 'update_user';
      user: IUser;
    }
  | {
      type: 'login_user';
      user: IUser;
    }
  | {
      type: 'logout_user';
    }
  | {
      type: 'set_user';
      user: IUser | null;
    };
