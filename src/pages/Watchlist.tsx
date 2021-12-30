import { useEffect, useState } from 'react';

import './Watchlist.css';

import Card from 'components/Card';
import Loader from 'components/Loader';

import { useStateValue } from 'context';
import { anilistActions } from 'actions';

function Watchlist() {
  const [{ watchlist, anilist_user }] = useStateValue();
  const [completed, setCompleted] = useState([]);
  const [watching, setWatching] = useState([]);

  useEffect(() => {
    if (anilist_user) {
      const { id, name } = anilist_user;
      anilistActions.getMediaListCollection(id, name).then((collection) => {
        console.log(collection);
        const completedList = collection.lists
          .find((item: any) => item.name === 'Completed')
          .entries.map((item: any) => item.media);
        const watchingList = collection.lists
          .find((item: any) => item.name === 'Watching')
          .entries.map((item: any) => item.media);
        setCompleted(completedList);
        setWatching(watchingList);
      });
    }
  }, [anilist_user]);

  return (
    <div className="watchlist">
      {watchlist.length > 0 ? (
        <>
          <h1>Watchlist</h1>
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
