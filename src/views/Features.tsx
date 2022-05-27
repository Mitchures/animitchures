import { useEffect } from 'react';
import { useQuery } from '@apollo/client';
import { motion } from 'framer-motion';

import './Features.css';

import Hero from 'components/Hero';
import Card from 'components/Card';
import Loader from 'components/Loader';

import { Media } from 'graphql/types';
import { FEATURED_QUERY } from 'graphql/queries';
import { useStateValue } from 'context';

interface ITitles {
  [key: string]: string;
}

const currentYear = new Date().getFullYear();
const currentMonth = new Date().getMonth() + 1;

const TITLES: ITitles = {
  trending: 'Trending Now',
  season: 'Popular This Season',
  nextSeason: 'Upcoming Next Season',
  popular: 'All Time Popular',
  top: 'Top Ranked',
};
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
          <h1>Discover</h1>
          <Hero {...featured} />
          {Object.keys(featured).map(
            (key, index) =>
              featured[key].media.length > 0 && (
                <div key={index}>
                  <div className="features__header">
                    <h3>{TITLES[key]}</h3>
                  </div>
                  <div className={`features__body features__${key}`}>
                    {featured[key].media.map((mediaItem: Media) => (
                      <Card key={mediaItem.id} {...mediaItem} />
                    ))}
                  </div>
                </div>
              ),
          )}
        </>
      ) : (
        <Loader />
      )}
    </motion.div>
  );
}

export default Features;
