import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Add, Check, Remove } from '@mui/icons-material';
import { useQuery } from '@apollo/client';
import { motion } from 'framer-motion';

import './Details.css';

import SplitButton from 'components/SplitButton';
import Loader from 'components/Loader';
import Sidebar from 'components/details/Sidebar';
import Summary from 'components/details/Summary';
import Relations from 'components/details/Relations';
import Characters from 'components/details/Characters';
import Staff from 'components/details/Staff';

import { Media } from 'graphql/types';
import { DETAILS_EXTENDED_QUERY } from 'graphql/queries';
import { addItemToWatchlist, removeItemFromWatchlist } from 'api';
import { useStateValue } from 'context';
import { authHeader } from 'helpers';

function Details() {
  const { id } = useParams<any>();
  const [{ user, watchlist, anilist_user }, dispatch] = useStateValue();
  const [selected, setSelected] = useState<Media | null>(null);
  const [removeButtonText, updateRemoveButtonText] = useState('Added to Watchlist');
  const { loading, data } = useQuery(DETAILS_EXTENDED_QUERY, {
    variables: {
      id,
      type: 'ANIME',
    },
    context: {
      headers: authHeader(),
    },
  });

  useEffect(() => {
    console.log(data);
    if (!loading && data) setSelected(data.Media);
    return () => setSelected(null);
  }, [data]);

  return !loading && selected ? (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="details"
    >
      <div
        className="details__banner"
        style={{
          backgroundImage: `url(${
            selected.bannerImage ? selected.bannerImage : selected.coverImage?.extraLarge
          })`,
        }}
      >
        <div className="details__bannerShadow"></div>
      </div>
      <div className="details__container">
        <div className="details__left">
          <img
            className="details__poster"
            src={selected.coverImage?.extraLarge || ''}
            alt={selected.title?.userPreferred || 'No Image'}
          />
          {user && (
            <div className="details__actions">
              {watchlist.filter(({ id }: Media) => id === selected.id).length > 0 ? (
                <button
                  onClick={() => removeItemFromWatchlist(selected, user.uid, dispatch)}
                  onMouseEnter={() => updateRemoveButtonText('Remove from Watchlist')}
                  onMouseLeave={() => updateRemoveButtonText('Added to Watchlist')}
                >
                  {removeButtonText === 'Added to Watchlist' ? <Check /> : <Remove />}
                  <span>{removeButtonText}</span>
                </button>
              ) : (
                <button onClick={() => addItemToWatchlist(selected, user.uid, dispatch)}>
                  <Add />
                  <span>Add to Watchlist</span>
                </button>
              )}
            </div>
          )}
          {/* TODO: implement anilist save entry feature */}
          {anilist_user && (
            <div className="details__actions">
              <SplitButton
                value={selected.mediaListEntry?.status as string}
                mediaId={selected.id}
              />
            </div>
          )}
          <Sidebar media={selected} />
        </div>
        <div className="details__right">
          <Summary media={selected} />
          <Relations relations={selected.relations} />
          <Characters characters={selected.characters} />
          <Staff staff={selected.staff} />
          {selected.trailer && (
            <>
              <h3>Trailer</h3>
              <div className="details__iframeWrapper">
                <iframe
                  src={`https://www.youtube.com/embed/${selected.trailer.id}`}
                  allow="autoplay; encrypted-media"
                  frameBorder="0"
                  allowFullScreen
                  title="video"
                  className="details__iframe"
                />
              </div>
            </>
          )}
        </div>
      </div>
    </motion.div>
  ) : (
    <Loader />
  );
}

export default Details;
