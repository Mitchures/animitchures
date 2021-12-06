import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();

const db = admin.firestore();

export const createProfile = functions.auth.user().onCreate(async (userRecord, context) => {
  const { uid, email, photoURL, displayName } = userRecord;
  const profile = {
    uid,
    email,
    photoURL,
    displayName,
    isAdult: false,
  };
  return await db.collection('users').doc(uid).set(profile).catch(console.error);
});

export const createWatchlist = functions.auth.user().onCreate(async (userRecord, context) => {
  const { uid } = userRecord;
  const watchlist = {
    watchlist: [],
  };
  return await db.collection('watchlists').doc(uid).set(watchlist).catch(console.error);
});
