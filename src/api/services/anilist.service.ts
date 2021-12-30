import { db } from 'config';
import { api } from 'api';
import { authHeader } from 'helpers'
import { ANILIST_VIEWER_QUERY, ANILIST_USER_MEDIA_LIST_COLLECTION_QUERY } from 'utils';

const collectionRef = db.collection('anilist');

export const anilistService = {
  getViewer: async (userId: any) => {
    const { data } = await api.fetch({
      headers: authHeader(),
      query: ANILIST_VIEWER_QUERY,
      variables: {},
    });
    console.log(data);
    const { Viewer } = data;
    // Save Viewer to database.
    return await collectionRef
      .doc(`${userId}`)
      .set(Viewer)
      .then(() => Viewer)
      .catch((error) => alert(error.message));
  },
  getMediaListCollection: async (userId: number, userName: string) => {
    const { data } = await api.fetch({
      query: ANILIST_USER_MEDIA_LIST_COLLECTION_QUERY,
      variables: {
        userId,
        userName,
        type: 'ANIME',
      },
    });
    console.log(data);
    const { MediaListCollection } = data;
    return MediaListCollection;
  },
  updateViewer: async (userId: any, viewer: any) => {
    return await collectionRef
      .doc(`${userId}`)
      .get()
      .then((docSnapshot) => {
        if (docSnapshot.exists) {
          const data = docSnapshot.data();
          if (data) {
            const updatedViewer = {
              ...data,
              viewer
            };
            return collectionRef
              .doc(`${userId}`)
              .update(updatedViewer)
              .then(() => updatedViewer)
              .catch((error) => alert(error.message));
          }
        }
      })
      .catch((error) => alert(error.message));
  },
  getAccount: async (userId: any) => {
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
