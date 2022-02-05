import { Link } from 'react-router-dom';
import './Card.css';

interface IMediaItem {
  [key: string]: any;
}

function Card({ id, title, coverImage, bannerImage, relationType }: IMediaItem) {
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
      {relationType && <p className="card__subLabel">{relationType}</p>}
    </Link>
  );
}

export default Card;
