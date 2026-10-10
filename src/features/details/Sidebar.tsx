import { ReactNode } from 'react';
import moment from 'moment';
import { Link } from 'react-router-dom';
import {
  Business,
  CalendarMonth,
  Favorite,
  Info,
  MenuBook,
  People,
  Schedule,
  Star,
  Tv,
} from '@mui/icons-material';

import './Sidebar.css';

import DotNumber from 'components/DotNumber';

import { compactCount } from 'features/discover/derive';
import { FuzzyDate, Media } from 'graphql/types';
import { titleCase, mainStudioNode, studioPath } from 'helpers';

const formatDate = (date: FuzzyDate) => {
  const { day, month, year } = date;
  if (day && month && year) return `${moment(month).format('MMMM')} ${day}, ${year}`;
  if (!day && month && year) return `${moment(month).format('MMMM')} ${year}`;
  if (!day && !month && year) return `${year}`;
  return 'TBD';
};

interface Row {
  key: string;
  icon: ReactNode;
  label: string;
  value: ReactNode;
}

/**
 * The metadata that did not earn a place in the hero, as a label-and-value list.
 *
 * It was a two-column grid of stacked label-over-value blocks with bold
 * headings, which read as fourteen small headlines rather than as a reference
 * table. A row per fact — icon and label on the left, value on the right — is
 * scannable, and the icon is what makes a row findable without reading it.
 *
 * `format` is read to tell a movie's single release date from a series'
 * start/end pair.
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
  const studio = mainStudioNode(studios);

  // `0` is in the union because a numeric field short-circuits to it, not to
  // false — `favourites` and `popularity` can legitimately be zero.
  const rows: (Row | false | 0 | undefined | null)[] = [
    nextAiringEpisode && {
      key: 'airing',
      icon: <Schedule />,
      label: 'Next episode',
      value: `${nextAiringEpisode.episode}, ${moment(
        moment.unix(nextAiringEpisode.airingAt),
      ).fromNow()}`,
    },
    format && {
      key: 'format',
      icon: <Tv />,
      label: 'Format',
      value: `${String(format).replace(/_/g, ' ')}${status ? `, ${titleCase(status)}` : ''}`,
    },
    startDate &&
      endDate &&
      (format === 'MOVIE'
        ? { key: 'released', icon: <CalendarMonth />, label: 'Released', value: formatDate(startDate) }
        : {
            key: 'aired',
            icon: <CalendarMonth />,
            label: 'Aired',
            // One row rather than two: a start and an end date are one fact,
            // and "Ongoing" is the end of it when there is no end yet.
            value: `${formatDate(startDate)} – ${
              status === 'RELEASING' ? 'ongoing' : formatDate(endDate)
            }`,
          }),
    season &&
      seasonYear && {
        key: 'season',
        icon: <Info />,
        label: 'Season',
        value: `${titleCase(season)} ${seasonYear}`,
      },
    averageScore && {
      key: 'score',
      icon: <Star />,
      label: 'Average score',
      value: (
        <>
          <DotNumber value={averageScore} size="sm" arrive="none" />
          <small>of 100</small>
        </>
      ),
    },
    source && { key: 'source', icon: <MenuBook />, label: 'Source', value: titleCase(source) },
    studio && {
      key: 'studio',
      icon: <Business />,
      label: 'Studio',
      value: (
        <Link className="sidebar__link" to={studioPath(studio.id, studio.name)}>
          {studio.name}
        </Link>
      ),
    },
    popularity && {
      key: 'popularity',
      icon: <People />,
      label: 'On lists',
      value: (
        <>
          <DotNumber value={compactCount(popularity)} size="sm" arrive="none" />
          <small>people</small>
        </>
      ),
    },
    favourites && {
      key: 'favourites',
      icon: <Favorite />,
      label: 'Favourited',
      value: (
        <>
          <DotNumber value={compactCount(favourites)} size="sm" arrive="none" />
          <small>people</small>
        </>
      ),
    },
  ];

  const shown = rows.filter(Boolean) as Row[];
  if (!shown.length) return null;

  return (
    <div className="sidebar">
      <h3>
        <Info />
        Details
      </h3>
      <dl className="sidebar__list">
        {shown.map((row) => (
          <div key={row.key} className="sidebar__row">
            <dt>
              {row.icon}
              {row.label}
            </dt>
            <dd>{row.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

export default Sidebar;
