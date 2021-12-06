import { db } from 'config';

interface IData {
  [key: string]: any;
}

const collectionRef = db.collection('watchlists');

export const watchlistService = {
  async get(userId: any) {
    return await collectionRef
      .doc(`${userId}`)
      .get()
      .then((docSnapshot) => {
        if (docSnapshot.exists) {
          const data = docSnapshot.data();
          if (data) return data.watchlist;
        }
      })
      .catch((error) => alert(error.message));
  },
  async add(media: IData, userId: any) {
    return await collectionRef
      .doc(`${userId}`)
      .get()
      .then((docSnapshot) => {
        if (docSnapshot.exists) {
          const data = docSnapshot.data();
          if (data) {
            const { watchlist } = data;
            const newWatchlist = {
              watchlist: [...watchlist, media],
            };
            return collectionRef
              .doc(`${userId}`)
              .update(newWatchlist)
              .then(() => newWatchlist)
              .catch((error) => alert(error.message));
          }
        }
      })
      .catch((error) => alert(error.message));
  },
  async remove(media: IData, userId: any) {
    return await collectionRef
      .doc(`${userId}`)
      .get()
      .then((docSnapshot) => {
        if (docSnapshot.exists) {
          const data = docSnapshot.data();
          if (data) {
            const { watchlist } = data;
            const newWatchlist = {
              watchlist: watchlist.filter((item: IData) => item.id !== media.id),
            };
            return collectionRef
              .doc(`${userId}`)
              .update(newWatchlist)
              .then(() => newWatchlist)
              .catch((error) => alert(error.message));
          }
        }
      })
      .catch((error) => alert(error.message));
  },
};
