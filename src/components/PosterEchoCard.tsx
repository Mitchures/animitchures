import { ReactNode } from 'react';
import { Link } from 'react-router-dom';

import './PosterEchoCard.css';

import Chip from 'components/Chip';
import DotNumber from 'components/DotNumber';
import { FeaturedMedia } from 'graphql/featured';
import { mediaPath } from 'helpers';

interface Props {
  media: FeaturedMedia;
  /** The "#n" chip, top left. Discover's Top rated row. */
  rank?: number;
  /** Something else for the top-left slot — Favorites puts the next episode there. */
  badge?: ReactNode;
  /** A line under the title: studio and year. */
  meta?: string;
}

/**
 * A title as the reference's product cards: one sharp poster over two blurred,
 * brightened copies of itself, so the art supplies its own glow instead of a
 * coloured card behind it. The echoes are clipped at the card's edge — a blur
 * spreads past its box, and without the clip they bled onto the canvas.
 *
 * The top-left slot takes either a rank or a badge; the card renders no chip
 * at all when given neither, so the stack keeps its place in the column.
 */
function PosterEchoCard({ media, rank, badge, meta }: Props) {
  const title = media.title.english ?? media.title.userPreferred;
  const poster = media.coverImage.extraLarge ?? media.coverImage.large ?? undefined;
  const corner =
    badge ?? (rank != null && <Chip tone={rank === 1 ? 'lime' : 'neutral'}>#{rank}</Chip>);

  return (
    <Link className="posterEchoCard" to={mediaPath(media.id, media.title.userPreferred)}>
      <span className="posterEchoCard__rank">{corner || null}</span>
      <span className="posterEchoCard__stack" aria-hidden="true">
        <img className="is-echo" src={poster} alt="" />
        <img className="is-echo" src={poster} alt="" />
        <img className="is-sharp" src={poster} alt={title} />
      </span>
      <span className="posterEchoCard__title">{title}</span>
      {meta && <span className="posterEchoCard__meta">{meta}</span>}
      {media.averageScore != null && <DotNumber value={media.averageScore} size="sm" />}
    </Link>
  );
}

export default PosterEchoCard;
