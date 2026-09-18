import { Link } from 'react-router-dom';

import './EpisodeRow.css';

import DotNumber from 'components/DotNumber';
import { Airing, whenLabel } from 'features/discover/derive';
import { mediaPath } from 'helpers';

interface Props {
  media: Airing;
  /** A small line above the title — "Airing next". */
  eyebrow?: string;
  now?: Date;
}

/**
 * The phone shape of an airing episode: a row rather than a card.
 *
 * Named for what it holds rather than its shape, because `features/watchlist`
 * already owns a `ListRow` with the same class names — and plain CSS is global,
 * so two `.listRow` rule sets would restyle each other's pages. The watchlist's
 * copy folds into this one when that page is redesigned.
 */
function EpisodeRow({ media, eyebrow, now = new Date() }: Props) {
  const title = media.title.english ?? media.title.userPreferred;
  const { episode, airingAt } = media.nextAiringEpisode;

  return (
    <Link
      className={`episodeRow${eyebrow ? ' episodeRow--lead' : ''}`}
      to={mediaPath(media.id, media.title.userPreferred)}
    >
      <img src={media.coverImage.large ?? undefined} alt="" />
      <div className="episodeRow__body">
        {eyebrow && <div className="episodeRow__eyebrow">{eyebrow}</div>}
        <div className="episodeRow__title">{title}</div>
        <div className="episodeRow__when">{whenLabel(airingAt, now)}</div>
      </div>
      <div className="episodeRow__number">
        <DotNumber value={episode} size="sm" />
        {media.episodes && <small>of {media.episodes}</small>}
      </div>
    </Link>
  );
}

export default EpisodeRow;
