import { useEffect } from 'react';
import './Details.css';
import { useParams } from 'react-router-dom';
import { DETAILS_QUERY, api } from 'utils';
import { useStateValue } from 'context';
import { db } from 'utils';
import { Add, Remove } from '@mui/icons-material';
import Long from 'long';

function Details() {
  const [{ selected, user }, dispatch] = useStateValue();
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

  const updateWatchlist = (animeId: Long) => {
    const docRef = db.collection('users').doc(`${user?.uid}`);
    docRef.get().then((doc) => {
      const data = doc.data();
      if (data) {
        const user = { ...data };
        // check if anime is already in user's watchlist.
        if (!user.watchlist.includes(animeId)) {
          user.watchlist.push(animeId);
        } else {
          // if anime is already in user watchist hen remove it.
          user.watchlist = user.watchlist.filter((id: Long) => id !== animeId);
        }
        // update db with new user watchlist.
        docRef.set(user).catch((error) => alert(error.message));
        // set current user to updated user.
        dispatch({
          type: 'set_user',
          user,
        });
      }
    });
  };

  return (
    <div className="details">
      <div
        className="details__banner"
        style={{
          backgroundImage: `url(${
            selected?.bannerImage ? selected.bannerImage : selected?.coverImage.extraLarge
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
          {user && (
            <div className="details__actions">
              {user.watchlist.includes(selected?.id) ? (
                <button onClick={() => updateWatchlist(selected?.id)}>
                  <Remove />
                  <span>Remove from Watchlist</span>
                </button>
              ) : (
                <button onClick={() => updateWatchlist(selected?.id)}>
                  <Add />
                  <span>Add to Watchlist</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Details;
