import { Dispatch } from 'react';
import { Action, IUser } from 'context/types';
import { userService } from 'api/services';

export const getProfile = async (userId: string, dispatch: Dispatch<Action>) => {
  return await userService
    .getProfile(userId)
    .then((user) => {
      dispatch({
        type: 'set_user',
        user: user as IUser
      })
    })
    .catch((error) => alert(error.message));
}

export const updateProfile = async (user: IUser, dispatch: Dispatch<Action>) => {
  return await userService
    .updateProfile(user)
    .then((updatedUser) => {
      dispatch({
        type: 'set_user',
        user: updatedUser as IUser
      })
    })
    .catch((error) => alert(error.message));
}