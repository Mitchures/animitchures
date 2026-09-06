import { useEffect } from 'react';
import { useQuery } from '@apollo/client';
import { motion } from 'framer-motion';

import './Features.css';

import Hero from 'components/Hero';
import AiringThisWeek from 'components/AiringThisWeek';
import GenreTiles from 'components/GenreTiles';
import PremiereSpine from 'components/PremiereSpine';
import UpcomingSeason from 'components/UpcomingSeason';
import PopularityList from 'components/PopularityList';
import RankChart from 'components/RankChart';
import Card from 'components/Card';
import Rail from 'components/Rail';
import Loader from 'components/Loader';

import { Media } from 'graphql/types';
import { FEATURED_QUERY } from 'graphql/queries';
import { useStateValue } from 'context';

const currentYear = new Date().getFullYear();
const currentMonth = new Date().getMonth() + 1;

const SEASONS = [
  {
    name: 'WINTER',
    months: [1, 2, 12],
  },
  {
    name: 'SPRING',
    months: [3, 4, 5],
  },
  {
    name: 'SUMMER',
    months: [6, 7, 8],
  },
  {
    name: 'FALL',
    months: [9, 10, 11],
  },
];

function Features() {
  const [{ featured, user }, dispatch] = useStateValue();

  const getSeason = (month: number) => {
    return SEASONS.find((season) => season.months.includes(month))?.name;
  };

  const getNextSeason = (month: number) => {
    const currentSeason = getSeason(month);
    return SEASONS.map(
      (season, index) =>
        season.name === currentSeason &&
        index >= 0 &&
        index < SEASONS.length - 1 &&
        SEASONS[index + 1].name,
    ).filter((item) => item)[0];
  };

  const { data } = useQuery(FEATURED_QUERY, {
    variables: {
      type: 'ANIME',
      season: getSeason(currentMonth),
      seasonYear: currentYear,
      nextSeason: getNextSeason(currentMonth),
      // Pass next year only when the season is FALL towards the end of the current year.
      nextYear: currentMonth <= 9 ? currentYear : currentYear + 1,
      isAdult: user?.isAdult || false,
    },
    pollInterval: 300000, // 5 minutes
  });

  useEffect(() => {
    if (data) {
      dispatch({
        type: 'set_featured',
        featured: data,
      });
    }
  }, [data]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="features"
    >
      {featured ? (
        <>
          {/* No "Discover" heading: the rail already says where you are, and it
              only pushed the artwork down the page. */}
          <Hero {...featured} />
          <AiringThisWeek featured={featured} />
          {featured.trending?.media?.length > 0 && (
            <Rail title="Trending now">
              {featured.trending.media.map((mediaItem: Media) => (
                <Card key={mediaItem.id} {...mediaItem} />
              ))}
            </Rail>
          )}

          {/* Genres sit high on the page, not buried under five rails — they
              are a way in, and nobody scrolls to the bottom to find one. */}
          <GenreTiles featured={featured} />

          {featured.top?.media?.length > 0 && <RankChart media={featured.top.media} />}

          {/* Each of the remaining sections renders differently, because each
              is sitting on different material: this season has dates but no
              scores, next season has banner art, all-time has figures worth
              printing, and top-ranked has an order that says more than its
              scores do. A single Rail for all of them was why the page read as
              five copies of one thing. */}
          {featured.season?.media?.length > 0 && <PremiereSpine media={featured.season.media} />}
          {featured.nextSeason?.media?.length > 0 && (
            <UpcomingSeason media={featured.nextSeason.media} />
          )}
          {featured.popular?.media?.length > 0 && <PopularityList media={featured.popular.media} />}
        </>
      ) : (
        <Loader />
      )}
    </motion.div>
  );
}

export default Features;
