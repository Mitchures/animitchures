import { Dispatch } from 'react';
import { Action } from 'context/types';
import { anilistService } from 'api/services';

export const anilistActions = {
  getViewer: async (userId: any, dispatch: Dispatch<Action>) => {
    return await anilistService
      .getViewer(userId)
      .then((anilist_account) => {
        dispatch({
          type: 'set_anilist_account',
          anilist_account
        })
      })
      .catch((error) => alert(error.message));
  },
  getMediaListCollection: async (userId: number, userName: string, dispatch: Dispatch<Action>) => {
    return await anilistService
      .getMediaListCollection(userId, userName)
      .then((data) => data)
      .catch((error) => alert(error.message));
  },
  getAccount: async (userId: any, dispatch: Dispatch<Action>) => {
    return await anilistService
      .getAccount(userId)
      .then((anilist_account) => {
        dispatch({
          type: 'set_anilist_account',
          anilist_account
        })
      })
      .catch((error) => alert(error.message));
  },
}