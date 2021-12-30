import { db } from 'config';
import { IUser } from 'context/types';

const collectionRef = db.collection('users');

export const userService = {
  async getProfile (userId: string) {
    return await collectionRef
      .doc(`${userId}`)
      .get()
      .then((docSnapshot) => {
        if (docSnapshot.exists) {
          const data = docSnapshot.data();
          if (data) return data;
        }
      })
      .catch((error) => alert(error.message));
  },
  async updateProfile (user: IUser) {
    return await collectionRef
      .doc(`${user.uid}`)
      .set(user)
      .then(() => user)
      .catch((error) => alert(error.message));
  },
}