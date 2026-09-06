import { Link } from 'react-router-dom';

import './ListRow.css';

import EpisodeStrip from './EpisodeStrip';

import { mediaPath } from 'helpers';
import { ScoreFormat, WatchlistEntry } from './types';

/** Ledger rows are narrow, so a tick has far less room here than in the band. */
const ROW_MAX_TICKS = 16;

const MONTH = 2_592_000;

const relative = (seconds: number | null) => {
  if (!seconds) return '';
  const elapsed = Math.floor(Date.now() / 1000) - seconds;
  if (elapsed < 86_400) return 'today';
  if (elapsed < 172_800) return 'yesterday';
  if (elapsed < 604_800) return `${Math.floor(elapsed / 86_400)} days ago`;
  if (elapsed < MONTH) return `${Math.floor(elapsed / 604_800)}w ago`;
  if (elapsed < MONTH * 12) return `${Math.floor(elapsed / MONTH)}mo ago`;
  return `${Math.floor(elapsed / (MONTH * 12))}y ago`;
};

/**
 * Writes a score the way the account keeps them.
 *
 * `MediaList.score` already comes back on the account's own scale — AniList
 * applies `mediaListOptions.scoreFormat` server-side unless you pass a format
 * argument. So there is nothing to convert here, only to punctuate: a 5-point
 * score needs its star, a decimal score needs its decimal place. Dividing by
 * 100 here turned a real 3-out-of-5 into "0".
 */
export const formatScore = (score: number, format: ScoreFormat | null) => {
  if (!score) return null;
  switch (format) {
    case 'POINT_10_DECIMAL':
      return score.toFixed(1);
    case 'POINT_5':
      return `${score}\u2605`;
    case 'POINT_3':
      return ['', '\u{1F641}', '\u{1F610}', '\u{1F642}'][score] ?? `${score}`;
    default:
      return `${score}`;
  }
};

interface Props {
  entry: WatchlistEntry;
  scoreFormat: ScoreFormat | null;
}

function ListRow({ entry, scoreFormat }: Props) {
  const { media } = entry;
  const score = formatScore(entry.score, scoreFormat);

  return (
    <Link className="listRow" to={mediaPath(media.id, media.title.userPreferred)}>
      <img src={media.coverImage.large} alt="" loading="lazy" />
      <span className="listRow__title">{media.title.userPreferred}</span>
      <span className="listRow__strip">
        <EpisodeStrip
          progress={entry.progress}
          episodes={media.episodes}
          maxTicks={ROW_MAX_TICKS}
        />
      </span>
      <span className="listRow__count">
        {entry.progress}
        <span>/{media.episodes ?? '?'}</span>
      </span>
      <span className={`listRow__score${score ? '' : ' is-unrated'}`}>{score ?? '—'}</span>
      <em className="listRow__when">{relative(entry.updatedAt)}</em>
    </Link>
  );
}

export default ListRow;
