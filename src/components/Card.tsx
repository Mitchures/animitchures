import { Link } from 'react-router-dom';
import './Card.css';

interface IMediaItem {
  [key: string]: any;
}

function Card({ id, title, coverImage, bannerImage }: IMediaItem) {
  return (
    <Link
      to={`/anime/${id}/${encodeURIComponent(
        title.userPreferred.replace(/,?[ ]/g, '-').toLowerCase(),
      )}`}
      className="card"
    >
      <img
        src={coverImage.extraLarge ? coverImage.extraLarge : bannerImage}
        alt={title.userPreferred}
      />
      <span className="card__label">
        <span className="card__labelTitle">
          {title.english ? title.english : title.userPreferred}
        </span>
      </span>
    </Link>
  );
}

export default Card;
