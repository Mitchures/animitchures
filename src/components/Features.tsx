import { useEffect } from 'react';
import './Features.css';
import { FEATURED_QUERY, api } from 'utils';
import { Link } from 'react-router-dom';
import { useStateValue } from 'context';
import Hero from './Hero';

interface ITitles {
  [key: string]: string;
}

function Features() {
  const [{ featured }, dispatch] = useStateValue();
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth();
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

  const getItems = async () => {
    const { data } = await api.fetch({
      query: FEATURED_QUERY,
      variables: {
        type: 'ANIME',
        season: getSeason(currentMonth),
        seasonYear: currentYear,
        nextSeason: getNextSeason(currentMonth),
        nextYear: currentYear + 1,
        isAdult: false,
      },
    });
    dispatch({
      type: 'set_featured',
      featured: data,
    });
  };

  useEffect(() => {
    getItems();
  }, []);

  return (
    <div className="features">
      <div className="features__header">
        <h3>Trending Now</h3>
      </div>
      {featured && <Hero {...featured} />}
      {featured &&
        Object.keys(featured).map((key, index) => (
          <div key={index}>
            <div className="features__header">
              <h3>{titles[key]}</h3>
            </div>
            <div className={`features__body features__${key}`}>
              {featured[key].media.map((mediaItem) => (
                <Link
                  to={`/anime/${mediaItem.id}/${mediaItem.title.userPreferred
                    .replace(/,?[ ]/g, '-')
                    .toLowerCase()}`}
                  className="features__item"
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
                  <span className="features__itemLabel">
                    <span className="features__itemLabelTitle">
                      {mediaItem.title.english
                        ? mediaItem.title.english
                        : mediaItem.title.userPreferred}
                    </span>
                  </span>
                </Link>
              ))}
            </div>
          </div>
        ))}
    </div>
  );
}

export default Features;
