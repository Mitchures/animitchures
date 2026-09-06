import { useCallback, useState } from 'react';
import { useMutation } from '@apollo/client';

import { UPDATE_ANILIST_USER_MUTATION } from 'graphql/mutations';
import { authHeader } from 'helpers';

export interface AnilistSettings {
  scoreFormat: string;
  rowOrder: string;
  airingNotifications: boolean;
  activityMergeTime: number;
  timezone: string;
  profileColor: string;
  splitCompletedSectionByFormat: boolean;
}

/**
 * Settings that live on AniList, written through `UpdateUser`.
 *
 * Every field is optional server-side and anything omitted is left alone, so
 * one changed control sends only itself rather than rewriting the account.
 *
 * State is held locally and updated optimistically: these are all reversible,
 * and a control that waits on a round trip to move reads as broken. A failed
 * write rolls the control back and surfaces the message, because unlike a
 * local preference there is no second copy to fall back on.
 */
export function useAnilistSettings(initial: Partial<AnilistSettings>) {
  const [settings, setSettings] = useState<Partial<AnilistSettings>>(initial);
  const [error, setError] = useState<string | null>(null);
  const [saveUser, { loading }] = useMutation(UPDATE_ANILIST_USER_MUTATION);

  const update = useCallback(
    <K extends keyof AnilistSettings>(key: K, value: AnilistSettings[K]) => {
      const previous = settings[key];
      setSettings((current) => ({ ...current, [key]: value }));
      setError(null);

      // The two list options travel inside animeListOptions; the rest are
      // top-level arguments.
      const variables =
        key === 'splitCompletedSectionByFormat'
          ? { animeListOptions: { splitCompletedSectionByFormat: value } }
          : { [key]: value };

      saveUser({ variables, context: { headers: authHeader() } }).catch((cause) => {
        setSettings((current) => ({ ...current, [key]: previous }));
        setError(cause instanceof Error ? cause.message : 'Could not save that on AniList');
      });
    },
    [saveUser, settings],
  );

  return { settings, update, saving: loading, error };
}
