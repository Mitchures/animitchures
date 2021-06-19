import { useEffect } from 'react';
import './Details.css';
import { useParams } from 'react-router-dom';
import { DETAILS_QUERY, api } from 'utils';
import { useStateValue } from 'context';

function Details() {
  const [{ selected }, dispatch] = useStateValue();
  const { id } = useParams<any>();

  useEffect(() => {
    const getItems = async () => {
      const { data } = await api.fetch({
        query: DETAILS_QUERY,
        variables: {
          id,
          type: 'ANIME',
          isAdult: false,
        },
      });
      console.log(data);
      dispatch({
        type: 'set_selected',
        selected: data.Media,
      });
    };
    getItems();

    return () => {
      dispatch({
        type: 'set_selected',
        selected: null,
      });
    };
  }, [id]);

  return (
    <div className="details">
      <div className="details__banner" style={{ backgroundImage: `url(${selected?.bannerImage})` }}>
        <div className="details__bannerShadow"></div>
      </div>
      <div className="details__container">
        <div className="details__left">
          <img
            width="400"
            className={`details__poster`}
            src={selected?.coverImage.extraLarge}
            alt={selected?.title.userPreferred}
          />
        </div>
        <div className="details__right">
          <div className="details__rightHeader">
            <h1>
              {selected?.title.english ? selected?.title.english : selected?.title.userPreferred}
            </h1>
          </div>
          <p dangerouslySetInnerHTML={{ __html: selected?.description }}></p>
        </div>
      </div>
    </div>
  );
}

export default Details;
