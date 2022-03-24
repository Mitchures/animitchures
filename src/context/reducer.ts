import { State, Action } from './types';

export const reducer = (state: State, action: Action): State => {
  console.log(state, action);
  switch (action.type) {
    case 'set_anilist_user':
      return {
        ...state,
        anilist_user: action.anilist_user
      };
    case 'clear_featured':
      return {
        ...state,
        featured: null,
      };
    case 'set_featured':
      return {
        ...state,
        featured: action.featured,
      };
    case 'set_user':
    case 'update_user':
    case 'login_user':
      return {
        ...state,
        user: action.user,
      };
    case 'logout_user':
      return {
        ...state,
        user: null,
        watchlist: [],
        anilist_user: null,
        // featured: null
      };
    case 'set_results':
      return {
        ...state,
        results: action.results,
      };
    case 'set_watchlist':
    case 'add_to_watchlist':
    case 'remove_from_watchlist':
      return {
        ...state,
        watchlist: action.watchlist,
      };
    case 'init_watchlist':
      return state;
    default:
      return state;
  }
};
