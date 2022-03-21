import { useEffect, useState } from 'react';
import { useQuery } from '@apollo/client';

import './Watchlist.css';

import Card from 'components/Card';
import Loader from 'components/Loader';

import { useStateValue } from 'context';
import { ANILIST_USER_MEDIA_LIST_COLLECTION_QUERY } from 'utils';

function Watchlist() {
  const [{ watchlist, anilist_user }] = useStateValue();
  const [completed, setCompleted] = useState([]);
  const [watching, setWatching] = useState([]);
  const { loading, error, data } = useQuery(ANILIST_USER_MEDIA_LIST_COLLECTION_QUERY, {
    variables: {
      userId: anilist_user?.id,
      userName: anilist_user?.name,
      type: 'ANIME',
    },
    skip: !anilist_user,
  });

  useEffect(() => {
    if (data) {
      const { MediaListCollection } = data;
      console.log(MediaListCollection);
      const completedList = MediaListCollection.lists
        .find((item: any) => item.name === 'Completed')
        .entries.map((item: any) => item.media);
      const watchingList = MediaListCollection.lists
        .find((item: any) => item.name === 'Watching')
        .entries.map((item: any) => item.media);
      setCompleted(completedList);
      setWatching(watchingList);
    }
  }, [data]);

  return (
    <div className="watchlist">
      {watchlist.length > 0 ? (
        <>
          <div className="watchlist__grid">
            {watchlist.map((mediaItem) => (
              <Card key={mediaItem.id} {...mediaItem} />
            ))}
          </div>
        </>
      ) : (
        <Loader placeholderText="Nothing to watch..." />
      )}
      {anilist_user && (
        <>
          <h1>Anilist Watchlist</h1>
          {watching.length > 0 && (
            <>
              <h3>Watching</h3>
              <div className="watchlist__grid">
                {watching.map((entry: any) => (
                  <Card key={entry.id} {...entry} />
                ))}
              </div>
            </>
          )}
          {completed.length > 0 && (
            <>
              <h3>Completed</h3>
              <div className="watchlist__grid">
                {completed.map((entry: any) => (
                  <Card key={entry.id} {...entry} />
                ))}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}

export default Watchlist;
