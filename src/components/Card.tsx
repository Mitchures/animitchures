import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

import './Card.css';

import { mediaPath } from 'helpers';
import { useTilt } from 'utils/hooks';

interface IMediaItem {
  [key: string]: any;
}

function Card({ id, title, coverImage, bannerImage, relationType }: IMediaItem) {
  // Same treatment as the Details hero poster, so a cover behaves the same way
  // wherever it appears. Shallower here: these are small and appear in grids.
  const { tilt, tiltProps, tiltTransition } = useTilt(9);
  // Convert text that may come back UpperCase.
  const convertText = (text: string) => {
    // Only return text as is if its suspected to be an acronym. ex: OVA or TV
    if (text.length <= 3) return text;
    if (text.includes('_')) text = text.replace(/_/g, ' ');
    return text.charAt(0).toUpperCase() + text.substring(1).toLowerCase();
  };

  return (
    <Link to={mediaPath(id, title.userPreferred)} className="card">
      <div className="card__poster" {...tiltProps}>
        <motion.img
          animate={{ rotateX: tilt.x, rotateY: tilt.y }}
          transition={tiltTransition}
          src={coverImage.large ? coverImage.large : bannerImage}
          alt={title.userPreferred}
        />
      </div>
      <span className="card__label">
        <span className="card__labelTitle">
          {title.english ? title.english : title.userPreferred}
        </span>
      </span>
      {relationType && <p className="card__subLabel">{convertText(relationType)}</p>}
    </Link>
  );
}

export default Card;
