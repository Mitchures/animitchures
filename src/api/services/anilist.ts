import { AccessToken } from 'context/types';
import { db } from 'config';
import { collection, setDoc, doc, getDoc, deleteDoc, DocumentSnapshot } from 'firebase/firestore';
import { FirebaseError } from 'firebase/app';

const collectionRef = collection(db, 'tokens');

export const saveAccessToken = async (token: AccessToken, userId: string) => {
  const docRef = doc(collectionRef, `${userId}`);
  return await setDoc(docRef, token)
    .then(() => token)
    .catch((error: FirebaseError) => alert(error.message));
};

export const getAccessToken = async (userId: string) => {
  const docRef = doc(collectionRef, `${userId}`);
  return await getDoc(docRef)
    .then((docSnapshot: DocumentSnapshot) => {
      if (docSnapshot.exists()) {
        const data = docSnapshot.data();
        if (data) return data as AccessToken;
      }
    })
    .catch((error: FirebaseError) => alert(error.message));
};

/**
 * Deletes the stored AniList token after AniList has refused it.
 *
 * Without this, `hydrateSession` reads the same dead token back out of
 * Firestore on the next sign-in and the app is exactly where it started. The
 * `anilist/{uid}` profile document is deliberately left alone — the account is
 * still linked, it is the credential that expired, and `hydrateSession` treats
 * that document's existence as the definition of "linked".
 */
export const deleteAccessToken = async (userId: string) => {
  const docRef = doc(collectionRef, `${userId}`);
  return await deleteDoc(docRef).catch((error: FirebaseError) => {
    // Nothing the user can act on, and the browser copy is already gone, so the
    // reconnect prompt shows either way.
    console.error('Could not delete the refused AniList token', error.message);
  });
};
