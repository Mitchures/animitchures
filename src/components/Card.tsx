import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

import './Card.css';

import { mediaPath, titleCase } from 'helpers';
import { useTilt } from 'utils/hooks';

/**
 * Card is spread from several query shapes — featured buckets, search results,
 * relations, recommendations — so it declares the fields it reads rather than
 * accepting an index signature of `any`. Spreading a wider object in is fine;
 * excess property checks do not apply to spreads.
 */
export interface CardMedia {
  id?: number | null;
  title?: { userPreferred?: string | null; english?: string | null } | null;
  coverImage?: { large?: string | null } | null;
  bannerImage?: string | null;
  relationType?: string | null;
}

function Card({ id, title, coverImage, bannerImage, relationType }: CardMedia) {
  // Same treatment as the Details hero poster, so a cover behaves the same way
  // wherever it appears. Shallower here: these are small and appear in grids.
  const { tilt, tiltProps, tiltTransition } = useTilt(9);

  // Every field is optional because the generated Media type wraps all of them
  // in Maybe<>. Without an id there is nowhere to link to, so there is no card.
  const preferred = title?.userPreferred ?? '';
  if (!id) return null;
  return (
    <Link to={mediaPath(id, preferred)} className="card">
      <div className="card__poster" {...tiltProps}>
        <motion.img
          animate={{ rotateX: tilt.x, rotateY: tilt.y }}
          transition={tiltTransition}
          src={coverImage?.large ?? bannerImage ?? ''}
          alt={preferred}
        />
      </div>
      <span className="card__label">
        <span className="card__labelTitle">{title?.english ?? preferred}</span>
      </span>
      {relationType && <p className="card__subLabel">{titleCase(relationType)}</p>}
    </Link>
  );
}

export default Card;
