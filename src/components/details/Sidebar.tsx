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

function Sidebar({
  title,
  status,
  nextAiringEpisode,
  format,
  episodes,
  duration,
  startDate,
  endDate,
  season,
  seasonYear,
  averageScore,
  studios,
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
      {format && (
        <div className="sidebar__data">
          <h5>Format</h5>
          <p>{convertText(format)}</p>
        </div>
      )}
      {episodes && (
        <div className="sidebar__data">
          <h5>Episodes</h5>
          <p>{episodes}</p>
        </div>
      )}
      {duration && (
        <div className="sidebar__data">
          <h5>Episode Duration</h5>
          <p>{duration} minutes</p>
        </div>
      )}
      {status && (
        <div className="sidebar__data">
          <h5>Status</h5>
          <p>{convertText(status)}</p>
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
                <p>{formatDate(endDate)}</p>
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
      {studios && (
        <div className="sidebar__data">
          <h5>Studio</h5>
          <p>{getStudio(studios)}</p>
        </div>
      )}
      {title && (
        <>
          {title.romaji && (
            <div className="sidebar__data">
              <h5>Romaji</h5>
              <p title={title.romaji}>{title.romaji}</p>
            </div>
          )}
          {title.native && (
            <div className="sidebar__data">
              <h5>Native</h5>
              <p title={title.native}>{title.native}</p>
            </div>
          )}
          {title.english && (
            <div className="sidebar__data">
              <h5>English</h5>
              <p title={title.english}>{title.english}</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default Sidebar;
