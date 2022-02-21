import { Dispatch } from 'react';
import { Action } from 'context/types';
import { watchlistService } from 'api/services';

interface IData {
  [key: string]: any;
}

export const getWatchlist = async (userId: string, dispatch: Dispatch<Action>) => {
  return await watchlistService
    .get(userId)
    .then((watchlist: IData[]) => {
      dispatch({
        type: 'set_watchlist',
        watchlist
      })
    })
    .catch((error) => alert(error.message));
}

export const addItemToWatchlist = async (media: IData, userId: string, dispatch: Dispatch<Action>) => {
  return await watchlistService
    .add(media, userId)
    .then(({ watchlist }: any) => {
      dispatch({
        type: 'add_to_watchlist',
        watchlist
      })
    })
    .catch((error) => alert(error.message));
}

export const removeItemFromWatchlist = async (media: IData, userId: string, dispatch: Dispatch<Action>) => {
  return await watchlistService
    .remove(media, userId)
    .then(({ watchlist }: any) => {
      dispatch({
        type: 'remove_from_watchlist',
        watchlist
      })
    })
    .catch((error) => alert(error.message));
}