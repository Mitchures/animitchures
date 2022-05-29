import './Summary.css';

import { Media } from 'graphql/types';

function Summary({ title, description, genres }: Media) {
  return (
    <div className="summary">
      <div className="summary__header">
        <h1>{title?.english ? title?.english : title?.userPreferred}</h1>
        <div className="summary__tags">
          {genres?.map((genre, index) => (
            <div key={`${genre}__${index}`} className="summary__tag">
              {genre}
            </div>
          ))}
        </div>
      </div>
      <p
        dangerouslySetInnerHTML={{
          __html: `${description !== null ? description : 'No description available'}`,
        }}
      ></p>
    </div>
  );
}

export default Summary;
