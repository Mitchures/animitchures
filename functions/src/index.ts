import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();

const db = admin.firestore();

export const createProfile = functions.auth.user().onCreate(async (userRecord, _) => {
  const { uid, email, photoURL, displayName } = userRecord;
  const profile = {
    uid,
    email,
    photoURL,
    displayName,
    isAdult: false,
    anilistLinked: false,
  };
  return await db.collection('users').doc(uid).set(profile).catch(console.error);
});

export const createWatchlist = functions.auth.user().onCreate(async (userRecord, _) => {
  const { uid } = userRecord;
  const watchlist = {
    watchlist: [],
  };
  return await db.collection('watchlists').doc(uid).set(watchlist).catch(console.error);
});

export const linkedAnilistAccount = functions.firestore
  .document('anilist/{docId}')
  .onCreate(async (_, context) => {
    const userId = context.params.docId;
    // Get User.
    const getUserPromise = admin.firestore().collection('users').doc(userId).get();
    // Resolve promises for Order and Messages.
    const userResults = await Promise.resolve(getUserPromise);
    const USER = userResults.data();
    const updatedUser = {
      ...USER,
      anilistLinked: true,
      preferredWatchlist: 'ANILIST',
    };
    return await db.collection('users').doc(userId).set(updatedUser).catch(console.error);
  });
