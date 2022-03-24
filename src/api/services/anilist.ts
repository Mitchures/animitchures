import { AccessToken } from 'context/types';
import { db } from 'config';

const collectionRef = db.collection('tokens');

export const saveAccessToken = async (token: AccessToken, userId: string) => {
  return await collectionRef
    .doc(`${userId}`)
    .set(token)
    .catch((error) => alert(error.message));
};

export const getAccessToken = async (userId: string) => {
  return await collectionRef
    .doc(`${userId}`)
    .get()
    .then((docSnapshot) => {
      if (docSnapshot.exists) {
        const data = docSnapshot.data();
        if (data) return data as AccessToken;
      }
    })
    .catch((error) => alert(error.message));
}