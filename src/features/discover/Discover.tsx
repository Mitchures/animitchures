import { useEffect } from 'react';
import { useQuery } from '@apollo/client';
import { motion } from 'framer-motion';

import './Discover.css';

import Hero from 'features/discover/Hero';
import AiringThisWeek from 'features/discover/AiringThisWeek';
import GenreTiles from 'features/discover/GenreTiles';
import PremiereSpine from 'features/discover/PremiereSpine';
import UpcomingSeason from 'features/discover/UpcomingSeason';
import PopularityList from 'features/discover/PopularityList';
import RankChart from 'features/discover/RankChart';
import Card from 'components/Card';
import Rail from 'features/discover/Rail';
import Loader from 'components/Loader';

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

  /* Buckets can be absent — the query returns whichever AniList had — so read
     them through one accessor rather than optional-chaining at every use. */
  const bucket = (key: string) => featured?.[key]?.media ?? [];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="discover"
    >
      {featured ? (
        <>
          {/* No "Discover" heading: the rail already says where you are, and it
              only pushed the artwork down the page. */}
          <Hero trending={featured.trending} />
          <AiringThisWeek featured={featured} />

          {bucket('trending').length > 0 && (
            <Rail title="Trending now">
              {bucket('trending').map((item) => (
                <Card key={item.id} {...item} />
              ))}
            </Rail>
          )}

          {/* Genres sit high on the page, not buried under five rails — they
              are a way in, and nobody scrolls to the bottom to find one. */}
          <GenreTiles featured={featured} />

          {bucket('top').length > 0 && <RankChart media={bucket('top')} />}

          {/* Each of the remaining sections renders differently, because each
              is sitting on different material: this season has dates but no
              scores, next season has banner art, all-time has figures worth
              printing, and top-ranked has an order that says more than its
              scores do. A single Rail for all of them was why the page read as
              five copies of one thing. */}
          {bucket('season').length > 0 && <PremiereSpine media={bucket('season')} />}
          {bucket('nextSeason').length > 0 && <UpcomingSeason media={bucket('nextSeason')} />}
          {bucket('popular').length > 0 && <PopularityList media={bucket('popular')} />}
        </>
      ) : (
        <Loader />
      )}
    </motion.div>
  );
}

export default Features;
