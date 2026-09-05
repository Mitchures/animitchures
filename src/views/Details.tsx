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
import DetailsTabs, { DetailsTab } from 'components/details/DetailsTabs';

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

  if (loading || !selected) return <Loader />;

  // The other titles this show goes by, minus whichever one is already the
  // heading. Deduped because romaji and userPreferred are frequently identical.
  const altTitles = [
    ...new Set(
      [selected.title?.romaji, selected.title?.english, selected.title?.native].filter(
        (title): title is string => Boolean(title) && title !== selected.title?.userPreferred,
      ),
    ),
  ];

  // Relations renders anime only, so the tab has to be gated on the same filter:
  // a title whose relations are all manga has edges but nothing to show, and
  // would otherwise open an empty tab.
  const animeRelations =
    selected.relations?.edges?.filter((edge) => edge?.node?.type === 'ANIME') ?? [];

  const tabs = [
    {
      id: 'overview',
      label: 'Overview',
      content: (
        <div className="details__overview">
          <div className="details__overviewMain">
            <Summary {...selected} />
            {selected.trailer && (
              <>
                <h3>Trailer</h3>
                <div className="details__iframeWrapper">
                  <iframe
                    src={`https://www.youtube.com/embed/${selected.trailer.id}`}
                    allow="autoplay; encrypted-media"
                    allowFullScreen
                    title="video"
                    className="details__iframe"
                  />
                </div>
              </>
            )}
          </div>
          <Sidebar {...selected} />
        </div>
      ),
    },
    selected.characters?.edges?.length && {
      id: 'characters',
      label: 'Characters',
      content: <Characters {...selected} />,
    },
    selected.staff?.edges?.length && {
      id: 'staff',
      label: 'Staff',
      content: <Staff {...selected} />,
    },
    animeRelations.length > 0 && {
      id: 'relations',
      label: 'Relations',
      content: <Relations {...selected} />,
    },
  ].filter(Boolean) as DetailsTab[];

  return (
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
      <DetailsTabs tabs={tabs} />
    </motion.div>
  );
}

export default Details;
