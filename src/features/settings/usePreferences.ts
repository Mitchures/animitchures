import { useCallback, useEffect } from 'react';

import { apolloClient } from 'config';
import { useStateValue } from 'context';
import { updateProfile } from 'api';
import { User } from 'context/types';
import {
  DEFAULT_PREFERENCES,
  Preferences,
  applyPreferences,
  cachePreferences,
  readCachedPreferences,
} from './preferences';

/**
 * The local preferences, kept in three places that have to agree.
 *
 * Firestore is the durable copy, `localStorage` is the mirror read
 * synchronously at boot so the first paint is already correct, and the
 * attributes on <html> are what the CSS actually reads. A change writes all
 * three, applying first so the UI responds before the network does.
 */
export function usePreferences() {
  const [{ user }, dispatch] = useStateValue();

  const preferences: Preferences = {
    ...DEFAULT_PREFERENCES,
    ...readCachedPreferences(),
    ...(user?.preferences ?? {}),
  };

  // The Firestore copy arrives after auth resolves, and may differ from the
  // mirror the boot code applied — on a new device the mirror is empty.
  useEffect(() => {
    if (!user?.preferences) return;
    const merged = { ...DEFAULT_PREFERENCES, ...user.preferences };
    applyPreferences(merged);
    cachePreferences(merged);
  }, [user?.preferences]);

  const update = useCallback(
    <K extends keyof Preferences>(key: K, value: Preferences[K]) => {
      const next = { ...preferences, [key]: value };

      // Apply before persisting: a setting that waits on a round trip to take
      // effect feels broken, and every one of these is reversible.
      applyPreferences(next);
      cachePreferences(next);

      /**
       * Language is resolved by an Apollo field policy, and a policy's `read`
       * result is memoised per field. The reactive variable behind it does
       * invalidate live queries, but a query that has since unmounted keeps
       * its computed value and serves it again on the way back — so titles
       * changed on the page you were on and nowhere else.
       *
       * Dropping the store is heavy-handed for most settings and exactly
       * right for this one: it happens once, deliberately, and leaves nothing
       * stale behind.
       */
      if (key === 'titleLanguage' || key === 'staffLanguage') {
        apolloClient.resetStore().catch(() => {
          // resetStore rejects if an in-flight query is cancelled by it.
          // Nothing to recover: the cache is cleared either way.
        });
      }

      if (!user) return;
      const updated = { ...user, preferences: next } as User;
      dispatch({ type: 'update_user', user: updated });
      updateProfile(updated).catch((error) => console.error('Could not save your settings', error));
    },
    [preferences, user, dispatch],
  );

  return { preferences, update };
}
