import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Add, Check, Remove } from '@mui/icons-material';
import { useQuery } from '@apollo/client';
import moment from 'moment';
import { motion } from 'framer-motion';

import './Details.css';

import SplitButton from 'components/SplitButton';
import Loader from 'components/Loader';
import Summary from 'components/details/Summary';
import Relations from 'components/details/Relations';
import Characters from 'components/details/Characters';
import Staff from 'components/details/Staff';

import { FuzzyDate, Media } from 'graphql/types';
import { DETAILS_EXTENDED_QUERY } from 'graphql/queries';
import { addItemToWatchlist, removeItemFromWatchlist } from 'api';
import { useStateValue } from 'context';
import { authHeader } from 'helpers';

// Convert text that may come back UpperCase.
const convertText = (text: string) => {
  // Only return text as is if its suspected to be an acronym. ex: OVA or TV
  if (text.length <= 3) return text;
  if (text.includes('_')) text = text.replace(/_/g, ' ');
  return text.charAt(0).toUpperCase() + text.substring(1).toLowerCase();
};

const formatDate = (date: FuzzyDate) => {
  const { day, month, year } = date;
  if (day && month && year) return `${moment(month).format('MMMM')} ${day}, ${year}`;
  else if (!day && month && year) return `${moment(month).format('MMMM')} ${year}`;
  else if (!day && !month && year) return `${year}`;
  else return 'TBD';
};

const getStudio = (studios: any) => {
  return studios.edges.map((studio: any) => studio.isMain && studio.node.name);
};

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

          <div className="details__dataContainer">
            {selected.nextAiringEpisode && (
              <div className="details__data details__data--active">
                <h5>Airing</h5>
                <p>
                  Episode {selected.nextAiringEpisode.episode}{' '}
                  {moment(moment.unix(selected.nextAiringEpisode.airingAt)).fromNow()}
                </p>
              </div>
            )}
            {selected.format && (
              <div className="details__data">
                <h5>Format</h5>
                <p>{convertText(selected.format)}</p>
              </div>
            )}
            {selected.episodes && (
              <div className="details__data">
                <h5>Episodes</h5>
                <p>{selected.episodes}</p>
              </div>
            )}
            {selected.duration && (
              <div className="details__data">
                <h5>Episode Duration</h5>
                <p>{selected.duration} minutes</p>
              </div>
            )}
            {selected.status && (
              <div className="details__data">
                <h5>Status</h5>
                <p>{convertText(selected.status)}</p>
              </div>
            )}
            {selected.startDate && selected.endDate && (
              <>
                {selected.format === 'MOVIE' ? (
                  <div className="details__data">
                    <h5>Release Date</h5>
                    <p>{formatDate(selected.startDate)}</p>
                  </div>
                ) : (
                  <>
                    <div className="details__data">
                      <h5>Start Date</h5>
                      <p>{formatDate(selected.startDate)}</p>
                    </div>
                    <div className="details__data">
                      <h5>End Date</h5>
                      <p>{formatDate(selected.endDate)}</p>
                    </div>
                  </>
                )}
              </>
            )}
            {selected.season && selected.seasonYear && (
              <div className="details__data">
                <h5>Season</h5>
                <p>{`${convertText(selected.season)} ${selected.seasonYear}`}</p>
              </div>
            )}
            {selected.averageScore && (
              <div className="details__data">
                <h5>Average Score</h5>
                <p>{selected.averageScore}%</p>
              </div>
            )}
            {selected.studios && (
              <div className="details__data">
                <h5>Studio</h5>
                <p>{getStudio(selected.studios)}</p>
              </div>
            )}
            {selected.title && (
              <>
                {selected.title.romaji && (
                  <div className="details__data">
                    <h5>Romaji</h5>
                    <p title={selected.title.romaji}>{selected.title.romaji}</p>
                  </div>
                )}
                {selected.title.native && (
                  <div className="details__data">
                    <h5>Native</h5>
                    <p title={selected.title.native}>{selected.title.native}</p>
                  </div>
                )}
                {selected.title.english && (
                  <div className="details__data">
                    <h5>English</h5>
                    <p title={selected.title.english}>{selected.title.english}</p>
                  </div>
                )}
              </>
            )}
          </div>
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