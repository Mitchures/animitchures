import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Add, Remove } from '@mui/icons-material';
import moment from 'moment';

import './Details.css';

import { DETAILS_EXTENDED_QUERY } from 'utils';
import { api } from 'api';
import { watchlistActions } from 'actions';
import { useStateValue } from 'context';

interface IData {
  [key: string]: any;
}

interface IDate {
  day: number | null;
  month: number | null;
  year: number | null;
}

function Details() {
  const [{ selected, user, watchlist }, dispatch] = useStateValue();
  const { id } = useParams<any>();

  useEffect(() => {
    const getItems = async () => {
      const { data } = await api.fetch({
        query: DETAILS_EXTENDED_QUERY,
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

  // Convert text that may come back UpperCase.
  const convertText = (text: string) => {
    // Only return text as is if its suspected to be an acronym. ex: OVA or TV
    if (text.length <= 3) return text;
    return text.charAt(0).toUpperCase() + text.substring(1).toLowerCase();
  };

  const formatDate = (date: IDate) => {
    const { day, month, year } = date;
    if (day && month && year) return `${moment(month).format('MMMM')} ${day}, ${year}`;
    else if (!day && month && year) return `${moment(month).format('MMMM')} ${year}`;
    else if (!day && !month && year) return `${year}`;
    else return 'TBD';
  };

  const getStudio = (studios: any) => {
    return studios.edges.map((studio: any) => studio.isMain && studio.node.name);
  };

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
            {user && (
              <div className="details__actions">
                {watchlist.filter(({ id }: IData) => id === selected.id).length > 0 ? (
                  <button
                    onClick={() =>
                      watchlistActions.removeItemFromWatchlist(selected, user.uid, dispatch)
                    }
                  >
                    <Remove />
                    <span>Remove from Watchlist</span>
                  </button>
                ) : (
                  <button
                    onClick={() =>
                      watchlistActions.addItemToWatchlist(selected, user.uid, dispatch)
                    }
                  >
                    <Add />
                    <span>Add to Watchlist</span>
                  </button>
                )}
              </div>
            )}
            <div className="details__dataContainer">
              {selected.nextAiringEpisode && (
                <div className="details__data details__data--active">
                  <h5>Airing</h5>
                  <p>
                    Episode {selected.nextAiringEpisode.episode}{' '}
                    {moment(moment.unix(selected.nextAiringEpisode.airingAt)).fromNow()}
                  </p>
                </div>
              )}
              {selected.format && (
                <div className="details__data">
                  <h5>Format</h5>
                  <p>{convertText(selected.format)}</p>
                </div>
              )}
              {selected.episodes && (
                <div className="details__data">
                  <h5>Episodes</h5>
                  <p>{selected.episodes}</p>
                </div>
              )}
              {selected.duration && (
                <div className="details__data">
                  <h5>Episode Duration</h5>
                  <p>{selected.duration} minutes</p>
                </div>
              )}
              {selected.status && (
                <div className="details__data">
                  <h5>Status</h5>
                  <p>{convertText(selected.status)}</p>
                </div>
              )}
              {selected.startDate && selected.endDate && (
                <>
                  {selected.format === 'MOVIE' ? (
                    <div className="details__data">
                      <h5>Release Date</h5>
                      <p>{formatDate(selected.startDate)}</p>
                    </div>
                  ) : (
                    <>
                      <div className="details__data">
                        <h5>Start Date</h5>
                        <p>{formatDate(selected.startDate)}</p>
                      </div>
                      <div className="details__data">
                        <h5>End Date</h5>
                        <p>{formatDate(selected.endDate)}</p>
                      </div>
                    </>
                  )}
                </>
              )}
              {selected.season && selected.seasonYear && (
                <div className="details__data">
                  <h5>Season</h5>
                  <p>{`${convertText(selected.season)} ${selected.seasonYear}`}</p>
                </div>
              )}
              {selected.averageScore && (
                <div className="details__data">
                  <h5>Average Score</h5>
                  <p>{selected.averageScore}%</p>
                </div>
              )}
              {selected.studios && (
                <div className="details__data">
                  <h5>Studio</h5>
                  <p>{getStudio(selected.studios)}</p>
                </div>
              )}
              {selected.title && (
                <>
                  {selected.title.romaji && (
                    <div className="details__data">
                      <h5>Romaji</h5>
                      <p title={selected.title.romaji}>{selected.title.romaji}</p>
                    </div>
                  )}
                  {selected.title.native && (
                    <div className="details__data">
                      <h5>Native</h5>
                      <p title={selected.title.native}>{selected.title.native}</p>
                    </div>
                  )}
                  {selected.title.english && (
                    <div className="details__data">
                      <h5>English</h5>
                      <p title={selected.title.english}>{selected.title.english}</p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
          <div className="details__right">
            <div className="details__rightHeader">
              <h1>
                {selected.title.english ? selected.title.english : selected.title.userPreferred}
              </h1>
              <div className="details__tags">
                {selected.genres.map((genre: string, index: number) => (
                  <div key={`${genre}__${index}`} className="details__tag">
                    {genre}
                  </div>
                ))}
              </div>
            </div>
            <p dangerouslySetInnerHTML={{ __html: selected.description }}></p>
            {selected.characterPreview.edges.length > 0 && (
              <>
                <h3>Characters</h3>
                <div className="details__characters">
                  {selected.characterPreview.edges.slice(0, 6).map((character: any) => (
                    <div key={character.id} className="details__character">
                      <div className="details__characterImage">
                        <img
                          src={character.node.image.large}
                          alt={character.node.name.userPreferred}
                        />
                      </div>
                      <div className="details__characterBody">
                        <h5>{character.node.name.userPreferred}</h5>
                        <p>{convertText(character.role)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
            {selected.trailer && (
              <>
                <h3>Trailer</h3>
                <iframe
                  src={`https://www.youtube.com/embed/${selected.trailer.id}`}
                  allow="autoplay; encrypted-media"
                  frameBorder="0"
                  allowFullScreen
                  title="video"
                  style={{
                    height: '500px',
                    width: '100%',
                    marginTop: '0.875rem',
                    borderRadius: '20px',
                  }}
                />
              </>
            )}
          </div>
        </div>
      </div>
    )
  );
}

export default Details;
