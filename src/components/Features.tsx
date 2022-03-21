import { useEffect } from 'react';
import './Features.css';
import { FEATURED_QUERY } from 'utils';
import { useStateValue } from 'context';
import Hero from './Hero';
import Card from './Card';
import Loader from './Loader';
import { useQuery } from '@apollo/client';

interface ITitles {
  [key: string]: string;
}

function Features() {
  const [{ featured, user }, dispatch] = useStateValue();
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;
  const seasons = [
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

  const titles: ITitles = {
    trending: 'Trending Now',
    season: 'Popular This Season',
    nextSeason: 'Upcoming Next Season',
    popular: 'All Time Popular',
    top: 'Top Ranked',
  };

  const getSeason = (month: number) => {
    return seasons.find((season) => season.months.includes(month))?.name;
  };

  const getNextSeason = (month: number) => {
    const currentSeason = getSeason(month);
    return seasons
      .map(
        (season, index) =>
          season.name === currentSeason &&
          index >= 0 &&
          index < seasons.length - 1 &&
          seasons[index + 1].name,
      )
      .filter((item) => item)[0];
  };

  const { error, loading, data } = useQuery(FEATURED_QUERY, {
    variables: {
      type: 'ANIME',
      season: getSeason(currentMonth),
      seasonYear: currentYear,
      nextSeason: getNextSeason(currentMonth),
      // Pass next year only when the season is FALL towards the end of the current year.
      nextYear: currentMonth <= 9 ? currentYear : currentYear + 1,
      isAdult: user?.isAdult || false,
    },
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
    <div className="features">
      {featured ? (
        <>
          <h1>Discover</h1>
          <Hero {...featured} />
          {Object.keys(featured).map((key, index) => (
            <div key={index}>
              <div className="features__header">
                <h3>{titles[key]}</h3>
              </div>
              <div className={`features__body features__${key}`}>
                {featured[key].media.map((mediaItem) => (
                  <Card key={mediaItem.id} {...mediaItem} />
                ))}
              </div>
            </div>
          ))}
        </>
      ) : (
        <Loader />
      )}
    </div>
  );
}

export default Features;
