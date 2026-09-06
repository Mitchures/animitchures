import { Dispatch } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import { collection, doc, getDoc, setDoc } from 'firebase/firestore';

import { db } from 'config';
import { Action, AnilistUser, User } from 'context/types';
import { getFavorites } from './favorites';
import { getAccessToken } from './anilist';

const userDoc = (uid: string) => doc(collection(db, 'users'), uid);
const anilistDoc = (uid: string) => doc(collection(db, 'anilist'), uid);

/**
 * Hydrating the store after Firebase resolves a session.
 *
 * This was ninety lines of nested `.then()` inside App's effect. Three things
 * were wrong with it beyond being hard to read:
 *
 * - It wrote the user document back on every sign-in, with exactly the data it
 *   had just read. The comment claimed it merged new information from the auth
 *   provider; it did not. That is one write per login for nothing.
 * - The reads ran in series — user, then favourites, then the AniList document,
 *   then the token — although only the token depends on anything.
 * - Every failure raised `alert()`, which blocks the page on something the user
 *   cannot act on. Each of these has a UI fallback already (no favourites is an
 *   empty list, no AniList document is the "link an account" state), so a
 *   failure logs and lets that fallback show.
 */
export const hydrateSession = async (authUser: FirebaseUser, dispatch: Dispatch<Action>) => {
  const { uid, photoURL, displayName, email } = authUser;

  // The user document and the AniList document do not depend on each other, so
  // one round trip rather than two. Favourites dispatch on their own and are
  // not awaited — nothing below needs them.
  getFavorites(uid, dispatch);

  const [userSnapshot, anilistSnapshot] = await Promise.all([
    getDoc(userDoc(uid)),
    getDoc(anilistDoc(uid)),
  ]);

  if (!userSnapshot.exists()) {
    const created: User = { uid, displayName, photoURL, email };
    await setDoc(userDoc(uid), created);
    dispatch({ type: 'login_user', user: created });
    return;
  }

  const user = { ...userSnapshot.data() } as User;
  const anilist = anilistSnapshot.exists() ? (anilistSnapshot.data() as AnilistUser) : null;

  // Dispatch before the AniList work: the private routes are gated on `user`,
  // so this is what unblocks routing, and nothing below changes it except the
  // flag repair.
  dispatch({ type: 'login_user', user });

  if (!anilist) return;

  dispatch({ type: 'set_anilist_user', anilist_user: anilist });

  if (!localStorage.getItem('token')) {
    const token = await getAccessToken(uid);
    if (token) localStorage.setItem('token', JSON.stringify(token));
  }

  // An anilist/{uid} document existing is what "linked" means; the flag on the
  // user document is a cache of it, written by a Cloud Function that fires
  // onCreate and so misses re-links entirely — and does nothing at all unless
  // functions are deployed. Repair the cache from the source of truth.
  if (!user.anilistLinked) {
    const linked = { ...user, anilistLinked: true };
    await setDoc(userDoc(uid), linked);
    dispatch({ type: 'update_user', user: linked });
  }
};

/** Clears everything the session put in place. */
export const clearSession = (dispatch: Dispatch<Action>) => {
  dispatch({ type: 'logout_user' });
  localStorage.removeItem('token');
};
