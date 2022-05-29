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

function Sidebar({ media }: { media: Media }) {
  return (
    <div className="sidebar">
      {media.nextAiringEpisode && (
        <div className="sidebar__data sidebar__data--active">
          <h5>Airing</h5>
          <p>
            Episode {media.nextAiringEpisode.episode}{' '}
            {moment(moment.unix(media.nextAiringEpisode.airingAt)).fromNow()}
          </p>
        </div>
      )}
      {media.format && (
        <div className="sidebar__data">
          <h5>Format</h5>
          <p>{convertText(media.format)}</p>
        </div>
      )}
      {media.episodes && (
        <div className="sidebar__data">
          <h5>Episodes</h5>
          <p>{media.episodes}</p>
        </div>
      )}
      {media.duration && (
        <div className="sidebar__data">
          <h5>Episode Duration</h5>
          <p>{media.duration} minutes</p>
        </div>
      )}
      {media.status && (
        <div className="sidebar__data">
          <h5>Status</h5>
          <p>{convertText(media.status)}</p>
        </div>
      )}
      {media.startDate && media.endDate && (
        <>
          {media.format === 'MOVIE' ? (
            <div className="sidebar__data">
              <h5>Release Date</h5>
              <p>{formatDate(media.startDate)}</p>
            </div>
          ) : (
            <>
              <div className="sidebar__data">
                <h5>Start Date</h5>
                <p>{formatDate(media.startDate)}</p>
              </div>
              <div className="sidebar__data">
                <h5>End Date</h5>
                <p>{formatDate(media.endDate)}</p>
              </div>
            </>
          )}
        </>
      )}
      {media.season && media.seasonYear && (
        <div className="sidebar__data">
          <h5>Season</h5>
          <p>{`${convertText(media.season)} ${media.seasonYear}`}</p>
        </div>
      )}
      {media.averageScore && (
        <div className="sidebar__data">
          <h5>Average Score</h5>
          <p>{media.averageScore}%</p>
        </div>
      )}
      {media.studios && (
        <div className="sidebar__data">
          <h5>Studio</h5>
          <p>{getStudio(media.studios)}</p>
        </div>
      )}
      {media.title && (
        <>
          {media.title.romaji && (
            <div className="sidebar__data">
              <h5>Romaji</h5>
              <p title={media.title.romaji}>{media.title.romaji}</p>
            </div>
          )}
          {media.title.native && (
            <div className="sidebar__data">
              <h5>Native</h5>
              <p title={media.title.native}>{media.title.native}</p>
            </div>
          )}
          {media.title.english && (
            <div className="sidebar__data">
              <h5>English</h5>
              <p title={media.title.english}>{media.title.english}</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default Sidebar;
