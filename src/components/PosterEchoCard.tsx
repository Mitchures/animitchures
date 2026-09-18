import { Link } from 'react-router-dom';

import './PosterEchoCard.css';

import Chip from 'components/Chip';
import DotNumber from 'components/DotNumber';
import { FeaturedMedia } from 'graphql/featured';
import { mediaPath } from 'helpers';

/**
 * A ranked title as the reference's product cards: one sharp poster over two
 * blurred, brightened copies of itself, so the art supplies its own glow
 * instead of a coloured card behind it.
 */
function PosterEchoCard({ media, rank }: { media: FeaturedMedia; rank: number }) {
  const title = media.title.english ?? media.title.userPreferred;
  const poster = media.coverImage.extraLarge ?? media.coverImage.large ?? undefined;

  return (
    <Link className="posterEchoCard" to={mediaPath(media.id, media.title.userPreferred)}>
      <span className="posterEchoCard__rank">
        <Chip tone={rank === 1 ? 'lime' : 'neutral'}>#{rank}</Chip>
      </span>
      <span className="posterEchoCard__stack" aria-hidden="true">
        <img className="is-echo" src={poster} alt="" />
        <img className="is-echo" src={poster} alt="" />
        <img className="is-sharp" src={poster} alt={title} />
      </span>
      <span className="posterEchoCard__title">{title}</span>
      {media.averageScore != null && <DotNumber value={media.averageScore} size="sm" />}
    </Link>
  );
}

export default PosterEchoCard;
