interface IData {
  [key: string]: any;
}

interface IMedia {
  media: IData[];
}

interface IFeatured {
  [key: string]: IMedia;
}

interface IUserState {
  uid?: string | null;
  displayName?: string | null;
  photoURL?: string | null;
  email?: string | null;
  isAdult?: boolean;
}

export type State = {
  user: IUserState | null;
  selected: IData | null;
  featured: IFeatured | null;
  results: IData | null;
  watchlist: IData[];
};

export type Action =
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
      featured: IFeatured | null;
    }
  | {
      type: 'set_selected';
      selected: IData | null;
    }
  | {
      type: 'update_user';
      user: IUserState;
    }
  | {
      type: 'login_user';
      user: IUserState;
    }
  | {
      type: 'logout_user';
    }
  | {
      type: 'set_user';
      user: IUserState | null;
    };
