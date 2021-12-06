import { State, Action } from './types';

export const reducer = (state: State, action: Action): State => {
  console.log(state, action);
  switch (action.type) {
    case 'set_featured':
      return {
        ...state,
        featured: action.featured,
      };
    case 'set_selected':
      return {
        ...state,
        selected: action.selected,
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
        watchlist: []
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
      return state
    default:
      return state;
  }
};
