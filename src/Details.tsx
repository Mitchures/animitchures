import { useEffect } from 'react';
import './Details.css';
import { useParams } from 'react-router-dom';
import { DETAILS_QUERY } from 'utils';
import { api } from 'api';
import { addItemToWatchlist, removeItemFromWatchlist } from 'actions';
import { useStateValue } from 'context';
import { Add, Remove } from '@mui/icons-material';

interface IData {
  [key: string]: any;
}

function Details() {
  const [{ selected, user, watchlist }, dispatch] = useStateValue();
  const { id } = useParams<any>();

  useEffect(() => {
    const getItems = async () => {
      const { data } = await api.fetch({
        query: DETAILS_QUERY,
        variables: {
          id,
          type: 'ANIME',
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
    selected && (
      <div className="details">
        <div
          className="details__banner"
          style={{
            backgroundImage: `url(${
              selected.bannerImage ? selected.bannerImage : selected.coverImage.extraLarge
            })`,
          }}
        >
          <div className="details__bannerShadow"></div>
        </div>
        <div className="details__container">
          <div className="details__left">
            <img
              width="400"
              className={`details__poster`}
              src={selected.coverImage.extraLarge}
              alt={selected.title.userPreferred}
            />
          </div>
          <div className="details__right">
            <div className="details__rightHeader">
              <h1>
                {selected.title.english ? selected.title.english : selected.title.userPreferred}
              </h1>
            </div>
            <p dangerouslySetInnerHTML={{ __html: selected.description }}></p>
            {user && (
              <div className="details__actions">
                {watchlist.filter(({ id }: IData) => id === selected.id).length > 0 ? (
                  <button onClick={() => removeItemFromWatchlist(selected, user.uid, dispatch)}>
                    <Remove />
                    <span>Remove from Watchlist</span>
                  </button>
                ) : (
                  <button onClick={() => addItemToWatchlist(selected, user.uid, dispatch)}>
                    <Add />
                    <span>Add to Watchlist</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    )
  );
}

export default Details;
