import './Summary.css';

import { Media } from 'graphql/types';

/**
 * The synopsis alone. The title and genres this used to repeat are the hero's
 * now — rendering them here as well showed the same title twice on one screen.
 */
function Summary({ description }: Media) {
  return (
    <div className="summary">
      <h3>Synopsis</h3>
      <p
        dangerouslySetInnerHTML={{
          __html: `${description !== null ? description : 'No description available'}`,
        }}
      ></p>
    </div>
  );
}

export default Summary;
