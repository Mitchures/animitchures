import { Dispatch } from 'react';
import { Action } from 'context/types';
import { db } from 'config';
import { collection, setDoc, doc, getDoc } from 'firebase/firestore';
import { FirebaseError } from 'firebase/app';

const collectionRef = collection(db, 'favorites');

const favoritesDoc = (userId: string) => doc(collectionRef, `${userId}`);

/**
 * The user's favourite media ids, or an empty list.
 *
 * The document is normally seeded by the createFavorites Cloud Function on sign
 * up, but an account created before that existed — or one whose document was
 * removed — has none. Every reader here previously destructured `{ favorites }`
 * out of a resolution that was `undefined` in exactly that case, which threw
 * rather than showing an empty list.
 */
const readFavorites = async (userId: string): Promise<number[]> => {
  const snapshot = await getDoc(favoritesDoc(userId));
  if (!snapshot.exists()) return [];
  return (snapshot.data()?.favorites as number[]) ?? [];
};

/**
 * setDoc with merge rather than updateDoc: updateDoc rejects when the document
 * is missing, so a user without one could never add a first favourite.
 */
const writeFavorites = async (userId: string, favorites: number[]) =>
  setDoc(favoritesDoc(userId), { favorites }, { merge: true });

const report = (error: unknown) => alert((error as FirebaseError).message);

export const getFavorites = async (userId: string, dispatch: Dispatch<Action>) => {
  try {
    dispatch({ type: 'set_favorites', favorites: await readFavorites(userId) });
  } catch (error) {
    report(error);
  }
};

export const addItemToFavorites = async (
  mediaId: number,
  userId: string,
  dispatch: Dispatch<Action>,
) => {
  try {
    const current = await readFavorites(userId);
    // Guard against double-adds: two fast clicks used to append the id twice,
    // which then took two clicks to remove.
    if (current.includes(mediaId)) return;

    const favorites = [...current, mediaId];
    await writeFavorites(userId, favorites);
    dispatch({ type: 'add_to_favorites', favorites });
  } catch (error) {
    report(error);
  }
};

export const removeItemFromFavorites = async (
  mediaId: number,
  userId: string,
  dispatch: Dispatch<Action>,
) => {
  try {
    const favorites = (await readFavorites(userId)).filter((item) => item !== mediaId);
    await writeFavorites(userId, favorites);
    dispatch({ type: 'remove_from_favorites', favorites });
  } catch (error) {
    report(error);
  }
};
