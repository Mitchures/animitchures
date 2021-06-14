import { useEffect, useState } from 'react';
import './Features.css';
import { FEATURED_QUERY } from 'utils';

function Features() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    const getItems = async () => {
      const options = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: FEATURED_QUERY,
          variables: {
            type: 'ANIME',
            season: 'SUMMER',
            seasonYear: 2021,
            nextSeason: 'FALL',
            nextYear: 2021,
          },
        }),
      };
      const resp = await fetch('https://graphql.anilist.co', options);
      const { data } = await resp.json();
      console.log(data);
      setItems(data);
    };
    getItems();
  }, []);

  return (
    <div className="features">
      <div className="features__header">
        <h2>Trending Now</h2>
      </div>
      <div className="features__body">
        {items['trending']?.media.map((item, index) => (
          <div className="features__item" key={index}>
            <img src={item.coverImage.large} alt={item.title.userPreferred} />
            <span className="features__itemLabel">
              <span className="features__itemLabelTitle">{item.title.userPreferred}</span>
            </span>
          </div>
        ))}
      </div>
      <div className="features__header">
        <h2>Popular This Season</h2>
      </div>
      <div className="features__body">
        {items['season']?.media.map((item, index) => (
          <div className="features__item" key={index}>
            <img height="300" src={item.coverImage.large} alt={item.title.userPreferred} />
            <span className="features__itemLabel">
              <span className="features__itemLabelTitle">{item.title.userPreferred}</span>
            </span>
          </div>
        ))}
      </div>
      <div className="features__header">
        <h2>Upcoming Next Season</h2>
      </div>
      <div className="features__body">
        {items['nextSeason']?.media.map((item, index) => (
          <div className="features__item" key={index}>
            <img height="300" src={item.coverImage.large} alt={item.title.userPreferred} />
            <span className="features__itemLabel">
              <span className="features__itemLabelTitle">{item.title.userPreferred}</span>
            </span>
          </div>
        ))}
      </div>
      <div className="features__header">
        <h2>All Time Popular</h2>
      </div>
      <div className="features__body">
        {items['popular']?.media.map((item, index) => (
          <div className="features__item" key={index}>
            <img height="300" src={item.coverImage.large} alt={item.title.userPreferred} />
            <span className="features__itemLabel">
              <span className="features__itemLabelTitle">{item.title.userPreferred}</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Features;
