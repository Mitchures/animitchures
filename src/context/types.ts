interface IData {
  [key: string]: any
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
}

export type State = {
  user: IUserState | null;
  selected: IData | null;
  featured: IFeatured | null;
};

export type Action =
  | {
      type: 'set_featured';
      featured: IFeatured;
    }
  | {
      type: 'set_selected';
      selected: IData | null;
    }
  | {
      type: 'set_user';
      user: IUserState | null;
    };
