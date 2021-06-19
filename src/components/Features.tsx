import { useEffect } from 'react';
import './Features.css';
import { FEATURED_QUERY, api } from 'utils';
import { Link } from 'react-router-dom';
import { useStateValue } from 'context';

interface ITitles {
  [key: string]: string;
}

function Features() {
  const [{ featured }, dispatch] = useStateValue();

  const titles: ITitles = {
    trending: 'Trending Now',
    season: 'Popular This Season',
    nextSeason: 'Upcoming Next Season',
    popular: 'All Time Popular',
    top: 'Top Ranked',
  };

  useEffect(() => {
    const getItems = async () => {
      const { data } = await api.fetch({
        query: FEATURED_QUERY,
        variables: {
          type: 'ANIME',
          season: 'SUMMER',
          seasonYear: 2021,
          nextSeason: 'FALL',
          nextYear: 2021,
        },
      });
      console.log(data);
      dispatch({
        type: 'set_featured',
        featured: data,
      });
    };
    getItems();
  }, []);

  return (
    <div className="features">
      {featured &&
        Object.keys(featured).map((key, index) => (
          <div key={index}>
            <div className="features__header">
              <h3>{titles[key]}</h3>
            </div>
            <div className="features__body">
              {featured[key].media.map((mediaItem) => (
                <Link
                  to={`/anime/${mediaItem.id}/${mediaItem.title.userPreferred
                    .replace(/,?[ ]/g, '-')
                    .toLowerCase()}`}
                  className="features__item"
                  key={mediaItem.id}
                >
                  <img src={mediaItem.coverImage.extraLarge} alt={mediaItem.title.userPreferred} />
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
