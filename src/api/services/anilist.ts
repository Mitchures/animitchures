import { AccessToken } from 'context/types';
import { db } from 'config';
import { collection, setDoc, doc, getDoc, DocumentSnapshot } from 'firebase/firestore';
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
