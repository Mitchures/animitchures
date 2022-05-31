import { Dispatch } from 'react';
import { Action } from 'context/types';
import { db } from 'config';
import { Media } from 'graphql/types';
import { collection, updateDoc, doc, getDoc, DocumentSnapshot } from 'firebase/firestore';
import { FirebaseError } from 'firebase/app';

const collectionRef = collection(db, 'favorites');

export const getFavorites = async (userId: string, dispatch: Dispatch<Action>) => {
  const docRef = doc(collectionRef, `${userId}`);
  return await getDoc(docRef)
    .then((docSnapshot: DocumentSnapshot) => {
      if (docSnapshot.exists()) {
        const data = docSnapshot.data();
        if (data) return data as Media[];
      }
    })
    .then(({ favorites }: any) => {
      dispatch({
        type: 'set_favorites',
        favorites,
      });
    })
    .catch((error: FirebaseError) => alert(error.message));
};

export const addItemToFavorites = async (
  mediaId: number,
  userId: string,
  dispatch: Dispatch<Action>,
) => {
  const docRef = doc(collectionRef, `${userId}`);
  return await getDoc(docRef)
    .then((docSnapshot: DocumentSnapshot) => {
      if (docSnapshot.exists()) {
        const data = docSnapshot.data();
        if (data) {
          const { favorites } = data;
          const newFavorites = {
            favorites: [...favorites, mediaId],
          };
          return updateDoc(docRef, newFavorites)
            .then(() => newFavorites)
            .catch((error: FirebaseError) => alert(error.message));
        }
      }
    })
    .then(({ favorites }: any) => {
      dispatch({
        type: 'add_to_favorites',
        favorites,
      });
    })
    .catch((error: FirebaseError) => alert(error.message));
};

export const removeItemFromFavorites = async (
  mediaId: number,
  userId: string,
  dispatch: Dispatch<Action>,
) => {
  const docRef = doc(collectionRef, `${userId}`);
  return await getDoc(docRef)
    .then((docSnapshot: DocumentSnapshot) => {
      if (docSnapshot.exists()) {
        const data = docSnapshot.data();
        if (data) {
          const { favorites } = data;
          const newFavorites = {
            favorites: favorites.filter((item: number) => item !== mediaId),
          };
          return updateDoc(docRef, newFavorites)
            .then(() => newFavorites)
            .catch((error: FirebaseError) => alert(error.message));
        }
      }
    })
    .then(({ favorites }: any) => {
      dispatch({
        type: 'remove_from_favorites',
        favorites,
      });
    })
    .catch((error: FirebaseError) => alert(error.message));
};
