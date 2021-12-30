import { Dispatch } from 'react';
import { Action } from 'context/types';
import { userService } from 'api/services';

export const userActions = {
  getProfile: async (userId: any, dispatch: Dispatch<Action>) => {
    return await userService
      .getProfile(userId)
      .then((user: any) => {
        dispatch({
          type: 'set_user',
          user
        })
      })
      .catch((error) => alert(error.message));
  },
  updateProfile: async (user: any, dispatch: Dispatch<Action>) => {
    return await userService
      .updateProfile(user)
      .then((updatedUser) => {
        dispatch({
          type: 'set_user',
          user: updatedUser
        })
      })
      .catch((error) => alert(error.message));
  }
}