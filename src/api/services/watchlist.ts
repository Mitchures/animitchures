import { Dispatch } from 'react';
import { Action } from 'context/types';
import { db } from 'config';
import { Media } from 'graphql/types';
import { collection, updateDoc, doc, getDoc, DocumentSnapshot } from 'firebase/firestore';
import { FirebaseError } from 'firebase/app';

const collectionRef = collection(db, 'watchlists');

export const getWatchlist = async (userId: string, dispatch: Dispatch<Action>) => {
  const docRef = doc(collectionRef, `${userId}`);
  return await getDoc(docRef)
    .then((docSnapshot: DocumentSnapshot) => {
      if (docSnapshot.exists()) {
        const data = docSnapshot.data();
        if (data) return data as Media[];
      }
    })
    .then(({ watchlist }: any) => {
      dispatch({
        type: 'set_watchlist',
        watchlist,
      });
    })
    .catch((error: FirebaseError) => alert(error.message));
};

export const addItemToWatchlist = async (
  media: Media,
  userId: string,
  dispatch: Dispatch<Action>,
) => {
  const docRef = doc(collectionRef, `${userId}`);
  return await getDoc(docRef)
    .then((docSnapshot: DocumentSnapshot) => {
      if (docSnapshot.exists()) {
        const data = docSnapshot.data();
        if (data) {
          const { watchlist } = data;
          const newWatchlist = {
            watchlist: [...watchlist, media],
          };
          return updateDoc(docRef, newWatchlist)
            .then(() => newWatchlist)
            .catch((error: FirebaseError) => alert(error.message));
        }
      }
    })
    .then(({ watchlist }: any) => {
      dispatch({
        type: 'add_to_watchlist',
        watchlist,
      });
    })
    .catch((error: FirebaseError) => alert(error.message));
};

export const removeItemFromWatchlist = async (
  media: Media,
  userId: string,
  dispatch: Dispatch<Action>,
) => {
  const docRef = doc(collectionRef, `${userId}`);
  return await getDoc(docRef)
    .then((docSnapshot: DocumentSnapshot) => {
      if (docSnapshot.exists()) {
        const data = docSnapshot.data();
        if (data) {
          const { watchlist } = data;
          const newWatchlist = {
            watchlist: watchlist.filter((item: Media) => item.id !== media.id),
          };
          return updateDoc(docRef, newWatchlist)
            .then(() => newWatchlist)
            .catch((error: FirebaseError) => alert(error.message));
        }
      }
    })
    .then(({ watchlist }: any) => {
      dispatch({
        type: 'remove_from_watchlist',
        watchlist,
      });
    })
    .catch((error: FirebaseError) => alert(error.message));
};
