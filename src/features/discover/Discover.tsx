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
import DiscoverSkeleton from './DiscoverSkeleton';

import { FEATURED_QUERY } from 'graphql/queries';
import { featuredVariables } from 'graphql/featured';
import { useStateValue } from 'context';

function Features() {
  const [{ featured, user }, dispatch] = useStateValue();

  // The same call AuthShell makes, so the wall of cover art behind the login
  // card warms this query's cache entry instead of fetching its own copy.
  const { data } = useQuery(FEATURED_QUERY, {
    variables: featuredVariables(user?.isAdult || false),
    // No polling. This was refetching 173 KB every five minutes against a
    // 30-requests-a-minute budget, for data that turns over seasonally — and the
    // airing countdowns it looked like it was serving are computed client-side
    // from `airingAt`, so they tick without it.
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
        <DiscoverSkeleton />
      )}
    </motion.div>
  );
}

export default Features;
