import { useMemo } from 'react';

import './Summary.css';

import { Media } from 'graphql/types';
import { sanitizeHtml } from 'helpers';

/**
 * The synopsis alone. The title and genres this used to repeat are the hero's
 * now — rendering them here as well showed the same title twice on one screen.
 */
function Summary({ description }: Media) {
  // AniList descriptions are community-edited HTML. Sanitised to a handful of
  // formatting tags before being injected — see helpers/sanitize-html.
  const html = useMemo(
    () => (description ? sanitizeHtml(description) : 'No description available'),
    [description],
  );

  return (
    <div className="summary">
      <h3>Synopsis</h3>
      <p dangerouslySetInnerHTML={{ __html: html }}></p>
    </div>
  );
}

export default Summary;
