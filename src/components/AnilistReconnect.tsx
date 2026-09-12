import { Link } from 'react-router-dom';

import './AnilistReconnect.css';

interface Props {
  /** What this page cannot show. Omit for the app-wide banner. */
  what?: string;
  variant?: 'panel' | 'banner';
}

/**
 * Shown once AniList stops accepting the saved session.
 *
 * Two shapes, because the damage is two different shapes. A dead token breaks
 * the authenticated *reads* — the Social feed — and every *write*: marking an
 * episode watched, changing list status, saving AniList settings. Watchlist,
 * Taste and Profile are untouched, since they read public data by user id and
 * never send credentials.
 *
 * So Social gets a panel where its content would be, and the shell gets a
 * banner, because otherwise the first sign anything is wrong is a progress
 * update that silently does nothing.
 *
 * Says nothing about tokens, revocation or why it happened. None of that
 * changes what the reader does next, which is press the button.
 */
function AnilistReconnect({ what, variant = 'panel' }: Props) {
  if (variant === 'banner') {
    return (
      <div className="anilistReconnect anilistReconnect--banner" role="status">
        <p>
          <strong>Your AniList session has expired.</strong> Changes you make will not be saved to
          AniList until you reconnect.
        </p>
        <Link to="/settings" className="anilistReconnect__action">
          Reconnect
        </Link>
      </div>
    );
  }

  return (
    <div className="anilistReconnect" role="status">
      <h3>Your AniList session has expired</h3>
      <p>Reconnect your account to see {what} again.</p>
      <Link to="/settings" className="anilistReconnect__action">
        Reconnect AniList
      </Link>
    </div>
  );
}

export default AnilistReconnect;
