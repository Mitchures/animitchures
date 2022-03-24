import { db } from 'config';
import { User } from 'context/types';

const collectionRef = db.collection('users');

export const getProfile = async (userId: string) => {
  return await collectionRef
    .doc(`${userId}`)
    .get()
    .then((docSnapshot) => {
      if (docSnapshot.exists) {
        const data = docSnapshot.data();
        if (data) return data as User;
      }
    })
    .catch((error) => alert(error.message));
};

export const updateProfile = async (user: User) => {
  return await collectionRef
    .doc(`${user.uid}`)
    .set(user)
    .then(() => user)
    .catch((error) => alert(error.message));
};