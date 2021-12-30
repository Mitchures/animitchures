import { db } from 'config';

const collectionRef = db.collection('users');

export const userService = {
  async getProfile (userId: any) {
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
  async updateProfile (user: any) {
    return await collectionRef
      .doc(`${user.uid}`)
      .set(user)
      .then(() => user)
      .catch((error) => alert(error.message));
  },
}