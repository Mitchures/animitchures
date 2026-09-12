import { useEffect } from 'react';
import { useReactiveVar } from '@apollo/client';

import { useStateValue } from 'context';
import { anilistTokenRefusedVar, hasStoredToken } from 'helpers';
import { deleteAccessToken } from 'api';

/**
 * Whether the AniList connection needs re-establishing, and the cleanup that
 * goes with discovering it.
 *
 * The state is **derived, not stored**: an AniList profile in the app's state
 * with no token beside it can only mean the credential is gone. That survives a
 * page reload with nothing persisted, and stops being true the moment a fresh
 * token is saved.
 *
 * The reactive variable is only there for the mid-session case — a token that
 * was valid when the page loaded and was refused thirty seconds later. Reading
 * it subscribes this hook to it, so the notice appears on the request that
 * failed rather than on the next mount.
 */
export const useAnilistReconnect = (): boolean => {
  const [{ user, anilist_user }] = useStateValue();
  const refused = useReactiveVar(anilistTokenRefusedVar);

  const needsReconnect = !!anilist_user && !hasStoredToken();

  useEffect(() => {
    // Only once the refusal actually happened. A signed-in user whose token is
    // simply absent — cleared browser storage, a new device — gets the same
    // prompt, but there is nothing to delete server-side, and deleting a token
    // that was never refused would log them out of AniList for no reason.
    if (!refused || !user?.uid) return;
    deleteAccessToken(user.uid);
  }, [refused, user?.uid]);

  return needsReconnect || refused;
};
