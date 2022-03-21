import { Dispatch } from 'react';
import { Action } from 'context/types';
import { db } from 'config';

interface IData {
  [key: string]: any;
}

const collectionRef = db.collection('watchlists');

export const getWatchlist = async (userId: string, dispatch: Dispatch<Action>) => {
  return await collectionRef
    .doc(`${userId}`)
    .get()
    .then((docSnapshot) => {
      if (docSnapshot.exists) {
        const data = docSnapshot.data();
        if (data) return data as IData[];
      }
    })
    .then(({ watchlist }: any) => {
      dispatch({
        type: 'set_watchlist',
        watchlist,
      });
    })
    .catch((error) => alert(error.message));
};

export const addItemToWatchlist = async (
  media: IData,
  userId: string,
  dispatch: Dispatch<Action>,
) => {
  return await collectionRef
    .doc(`${userId}`)
    .get()
    .then((docSnapshot) => {
      if (docSnapshot.exists) {
        const data = docSnapshot.data();
        if (data) {
          const { watchlist } = data;
          const newWatchlist = {
            watchlist: [...watchlist, media],
          };
          return collectionRef
            .doc(`${userId}`)
            .update(newWatchlist)
            .then(() => newWatchlist)
            .catch((error) => alert(error.message));
        }
      }
    })
    .then(({ watchlist }: any) => {
      dispatch({
        type: 'add_to_watchlist',
        watchlist,
      });
    })
    .catch((error) => alert(error.message));
};

export const removeItemFromWatchlist = async (
  media: IData,
  userId: string,
  dispatch: Dispatch<Action>,
) => {
  return await collectionRef
    .doc(`${userId}`)
    .get()
    .then((docSnapshot) => {
      if (docSnapshot.exists) {
        const data = docSnapshot.data();
        if (data) {
          const { watchlist } = data;
          const newWatchlist = {
            watchlist: watchlist.filter((item: IData) => item.id !== media.id),
          };
          return collectionRef
            .doc(`${userId}`)
            .update(newWatchlist)
            .then(() => newWatchlist)
            .catch((error) => alert(error.message));
        }
      }
    })
    .then(({ watchlist }: any) => {
      dispatch({
        type: 'remove_from_watchlist',
        watchlist,
      });
    })
    .catch((error) => alert(error.message));
};
