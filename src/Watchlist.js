import { useState, useEffect } from 'react';
import './Watchlist.css';
import { useStateValue } from 'context';
import { DETAILS_QUERY, api } from 'utils';
import { Link } from 'react-router-dom';

function Watchlist() {
  const [{ user }] = useStateValue();
  const [watchlist, setWatchlist] = useState([]);

  const getItem = async (id) => {
    const { data } = await api.fetch({
      query: DETAILS_QUERY,
      variables: {
        id,
        type: 'ANIME',
        isAdult: false,
      },
    });
    setWatchlist((watchlist) =>
      [...watchlist, data.Media].sort((a, b) =>
        a.title.userPreferred.localeCompare(b.title.userPreferred),
      ),
    );
  };

  useEffect(() => {
    if (user) user.watchlist.forEach((id) => getItem(id));
    return () => setWatchlist(() => []);
  }, [user]);

  return (
    <div className="watchlist">
      {watchlist.length > 0 && (
        <div className="watchlist__container">
          {watchlist?.map((mediaItem) => (
            <Link
              to={`/anime/${mediaItem.id}/${mediaItem.title.userPreferred
                .replace(/,?[ ]/g, '-')
                .toLowerCase()}`}
              className="watchlist__item"
              key={mediaItem.id}
            >
              <img
                src={
                  mediaItem.coverImage.extraLarge
                    ? mediaItem.coverImage.extraLarge
                    : mediaItem.bannerImage
                }
                alt={mediaItem.title.userPreferred}
              />
              <span className="watchlist__itemLabel">
                <span className="watchlist__itemLabelTitle">
                  {mediaItem.title.english
                    ? mediaItem.title.english
                    : mediaItem.title.userPreferred}
                </span>
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default Watchlist;
