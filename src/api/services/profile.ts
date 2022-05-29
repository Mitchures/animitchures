import { db } from 'config';
import { User } from 'context/types';
import { collection, setDoc, doc, getDoc, DocumentSnapshot } from 'firebase/firestore';
import { FirebaseError } from 'firebase/app';

const collectionRef = collection(db, 'users');

export const getProfile = async (userId: string) => {
  const docRef = doc(collectionRef, `${userId}`);
  return await getDoc(docRef)
    .then((docSnapshot: DocumentSnapshot) => {
      if (docSnapshot.exists()) {
        const data = docSnapshot.data();
        if (data) return data as User;
      }
    })
    .catch((error: FirebaseError) => alert(error.message));
};

export const updateProfile = async (user: User) => {
  const docRef = doc(collectionRef, `${user.uid}`);
  return await setDoc(docRef, user)
    .then(() => user)
    .catch((error: FirebaseError) => alert(error.message));
};
