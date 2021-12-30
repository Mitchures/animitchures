import { db } from 'config';

interface IData {
  [key: string]: any;
}

const collectionRef = db.collection('watchlists');

export const watchlistService = {
  get: async (userId: string) => {
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
  add: async (media: IData, userId: string) => {
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
  remove: async (media: IData, userId: string) => {
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
