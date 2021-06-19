import { State, Action } from './types';

export const reducer = (state: State, action: Action): State => {
  console.log(state, action);
  switch (action.type) {
    case "set_featured":
      return {
        ...state,
        featured: action.featured,
      };
    case "set_selected":
      return {
        ...state,
        selected: action.selected,
      };
    case "set_user":
      return {
        ...state,
        user: action.user,
      };
    default:
      return state;
  }
};
