interface UserState {
  uid?: string | null;
  name?: string | null;
  photoURL?: string | null;
  email?: string | null;
}

export type State = {
  user: UserState | null;
};

export type Action = {
  type: 'set_user';
  user: UserState;
};
