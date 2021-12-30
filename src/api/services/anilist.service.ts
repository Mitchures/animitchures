import { db } from 'config';
import { api } from 'api';
import { authHeader } from 'helpers'
import { ANILIST_VIEWER_QUERY, ANILIST_USER_MEDIA_LIST_COLLECTION_QUERY } from 'utils';

const collectionRef = db.collection('anilist');

export const anilistService = {
  // fetches
  fetchUser: async () => {
    const { data } = await api.fetch({
      headers: authHeader(),
      query: ANILIST_VIEWER_QUERY,
      variables: {},
    });
    console.log(data);
    const { Viewer } = data;
    return Viewer;
  },
  fetchMediaListCollection: async (anilistUserId: number, userName: string) => {
    const { data } = await api.fetch({
      query: ANILIST_USER_MEDIA_LIST_COLLECTION_QUERY,
      variables: {
        userId: anilistUserId,
        userName,
        type: 'ANIME',
      },
    });
    console.log(data);
    const { MediaListCollection } = data;
    return MediaListCollection;
  },
  // database queries
  saveUser: async (userId: string, anilistUser: any) => {
    return await collectionRef
      .doc(`${userId}`)
      .set(anilistUser)
      .then(() => anilistUser)
      .catch((error) => alert(error.message));
  },
  getUser: async (userId: string) => {
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
};
