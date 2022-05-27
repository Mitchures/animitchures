import './Summary.css';

import { Media } from 'graphql/types';

function Summary({ media }: { media: Media }) {
  return (
    <div className="summary">
      <div className="summary__header">
        <h1>{media.title?.english ? media.title?.english : media.title?.userPreferred}</h1>
        <div className="summary__tags">
          {media.genres?.map((genre, index) => (
            <div key={`${genre}__${index}`} className="summary__tag">
              {genre}
            </div>
          ))}
        </div>
      </div>
      <p
        dangerouslySetInnerHTML={{
          __html: `${media.description !== null ? media.description : 'No description available'}`,
        }}
      ></p>
    </div>
  );
}

export default Summary;
