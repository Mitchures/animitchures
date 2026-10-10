import { MenuBook } from '@mui/icons-material';

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
  const html = useMemo(() => (description ? sanitizeHtml(description) : ''), [description]);

  // The panel is the card's background, so an empty one is a grey block. A
  // missing synopsis is worth saying once, though — it is the thing a viewer
  // came for — so this keeps the panel and says so rather than vanishing.
  if (!html) {
    return (
      <div className="summary">
        <h3>
          <MenuBook />
          Synopsis
        </h3>
        <p>AniList has no synopsis for this one yet.</p>
      </div>
    );
  }

  return (
    <div className="summary">
      <h3>
        <MenuBook />
        Synopsis
      </h3>
      <p dangerouslySetInnerHTML={{ __html: html }}></p>
    </div>
  );
}

export default Summary;
