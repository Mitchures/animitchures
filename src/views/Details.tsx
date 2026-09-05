import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import { motion } from 'framer-motion';

import './Details.css';

import Loader from 'components/Loader';
import Sidebar from 'components/details/Sidebar';
import Summary from 'components/details/Summary';
import Relations from 'components/details/Relations';
import Characters from 'components/details/Characters';
import Staff from 'components/details/Staff';
import Actions from 'components/details/Actions';
import HeroMeta from 'components/details/HeroMeta';

import { Media } from 'graphql/types';
import { DETAILS_EXTENDED_QUERY } from 'graphql/queries';
import { authHeader } from 'helpers';

function Details() {
  const { id } = useParams<any>();
  const [selected, setSelected] = useState<Media | null>(null);
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

  // The other titles this show goes by, minus whichever one is already the
  // heading. Deduped because romaji and userPreferred are frequently identical.
  const altTitles = selected
    ? [
        ...new Set(
          [selected.title?.romaji, selected.title?.english, selected.title?.native].filter(
            (title): title is string => Boolean(title) && title !== selected.title?.userPreferred,
          ),
        ),
      ]
    : [];

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
        <div className="details__bannerScrim"></div>
        <div className="details__hero">
          <img
            className="details__poster"
            src={selected.coverImage?.extraLarge || ''}
            alt={selected.title?.userPreferred || 'No Image'}
          />
          <div className="details__heroBody">
            <h1 className="details__title">{selected.title?.userPreferred}</h1>
            {altTitles.length > 0 && <p className="details__altTitles">{altTitles.join(' · ')}</p>}
            {selected.genres && selected.genres.length > 0 && (
              <div className="details__tags">
                {selected.genres.map((genre) => (
                  <span key={`${genre}`} className="details__tag">
                    {genre}
                  </span>
                ))}
              </div>
            )}
            <HeroMeta media={selected} />
          </div>
          <Actions media={selected} />
        </div>
      </div>
      <div className="details__container">
        <div className="details__left">
          <Sidebar {...selected} />
        </div>
        <div className="details__right">
          <Summary {...selected} />
          <Relations {...selected} />
          <Characters {...selected} />
          <Staff {...selected} />
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
