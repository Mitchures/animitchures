import { Link } from 'react-router-dom';

import './Card.css';

interface IMediaItem {
  [key: string]: any;
}

function Card({ id, title, coverImage, bannerImage, relationType }: IMediaItem) {
  // Convert text that may come back UpperCase.
  const convertText = (text: string) => {
    // Only return text as is if its suspected to be an acronym. ex: OVA or TV
    if (text.length <= 3) return text;
    if (text.includes('_')) text = text.replace(/_/g, ' ');
    return text.charAt(0).toUpperCase() + text.substring(1).toLowerCase();
  };

  return (
    <Link
      to={`/anime/${id}/${encodeURIComponent(
        title.userPreferred.replace(/,?[ ]/g, '-').toLowerCase(),
      )}`}
      className="card"
    >
      <img src={coverImage.large ? coverImage.large : bannerImage} alt={title.userPreferred} />
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
