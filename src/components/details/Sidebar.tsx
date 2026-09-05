import moment from 'moment';

import './Sidebar.css';

import { FuzzyDate, Media } from 'graphql/types';

// Convert text that may come back UpperCase.
const convertText = (text: string) => {
  // Only return text as is if its suspected to be an acronym. ex: OVA or TV
  if (text.length <= 3) return text;
  if (text.includes('_')) text = text.replace(/_/g, ' ');
  return text.charAt(0).toUpperCase() + text.substring(1).toLowerCase();
};

const formatDate = (date: FuzzyDate) => {
  const { day, month, year } = date;
  if (day && month && year) return `${moment(month).format('MMMM')} ${day}, ${year}`;
  else if (!day && month && year) return `${moment(month).format('MMMM')} ${year}`;
  else if (!day && !month && year) return `${year}`;
  else return 'TBD';
};

const getStudio = (studios: any) => {
  return studios.edges.map((studio: any) => studio.isMain && studio.node.name);
};

/**
 * The metadata that did not earn a place in the hero.
 *
 * Format, Episodes, Episode Duration and Status are HeroMeta chips now, and the
 * romaji/native/english titles sit under the heading as alternative names — they
 * are what the show is called, not facts about it. `format` is still read here
 * to tell a movie's single release date from a series' start/end pair.
 */
function Sidebar({
  status,
  nextAiringEpisode,
  format,
  startDate,
  endDate,
  season,
  seasonYear,
  averageScore,
  studios,
  source,
  popularity,
  favourites,
}: Media) {
  return (
    <div className="sidebar">
      {nextAiringEpisode && (
        <div className="sidebar__data sidebar__data--active">
          <h5>Airing</h5>
          <p>
            Episode {nextAiringEpisode.episode}{' '}
            {moment(moment.unix(nextAiringEpisode.airingAt)).fromNow()}
          </p>
        </div>
      )}
      {startDate && endDate && (
        <>
          {format === 'MOVIE' ? (
            <div className="sidebar__data">
              <h5>Release Date</h5>
              <p>{formatDate(startDate)}</p>
            </div>
          ) : (
            <>
              <div className="sidebar__data">
                <h5>Start Date</h5>
                <p>{formatDate(startDate)}</p>
              </div>
              <div className="sidebar__data">
                <h5>End Date</h5>
                {/* An unfinished show has no end date to report yet. */}
                <p>{status === 'RELEASING' ? 'Ongoing' : formatDate(endDate)}</p>
              </div>
            </>
          )}
        </>
      )}
      {season && seasonYear && (
        <div className="sidebar__data">
          <h5>Season</h5>
          <p>{`${convertText(season)} ${seasonYear}`}</p>
        </div>
      )}
      {averageScore && (
        <div className="sidebar__data">
          <h5>Average Score</h5>
          <p>{averageScore}%</p>
        </div>
      )}
      {source && (
        <div className="sidebar__data">
          <h5>Source</h5>
          <p>{convertText(source)}</p>
        </div>
      )}
      {studios && (
        <div className="sidebar__data">
          <h5>Studio</h5>
          <p>{getStudio(studios)}</p>
        </div>
      )}
      {popularity && (
        <div className="sidebar__data">
          <h5>Popularity</h5>
          <p>{popularity.toLocaleString()}</p>
        </div>
      )}
      {favourites && (
        <div className="sidebar__data">
          <h5>Favorites</h5>
          <p>{favourites.toLocaleString()}</p>
        </div>
      )}
    </div>
  );
}

export default Sidebar;
