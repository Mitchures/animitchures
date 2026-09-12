import { makeVar } from '@apollo/client';

import { clearStoredToken, hasStoredToken } from './auth-header';

/**
 * Whether the stored AniList token has been refused.
 *
 * A reactive variable rather than React state because the thing that discovers
 * this is Apollo's error link, which lives outside the component tree — the
 * same reason `title-language.ts` uses one. Components read it with
 * `useReactiveVar` and re-render the moment a request comes back refused,
 * rather than waiting until something happens to remount them.
 *
 * On a fresh page load nothing sets this, and nothing needs to: the reconnect
 * state is derived from an AniList profile existing while no token does, which
 * survives a reload on its own. This var covers the mid-session case, where the
 * token was there a moment ago.
 */
export const anilistTokenRefusedVar = makeVar(false);

/**
 * Called when AniList refuses a token we sent.
 *
 * Clears the browser copy immediately. The Firestore copy is deleted by
 * `useAnilistReconnect`, which has the uid — doing it here would mean reaching
 * for auth state from inside a link, and the link fires per request while the
 * delete only needs to happen once.
 */
export const markAnilistTokenRefused = (): void => {
  if (hasStoredToken()) clearStoredToken();
  if (!anilistTokenRefusedVar()) anilistTokenRefusedVar(true);
};

/** Called once a fresh token is stored, so the notice stops showing. */
export const clearAnilistTokenRefused = (): void => {
  if (anilistTokenRefusedVar()) anilistTokenRefusedVar(false);
};

/**
 * AniList's two auth rejections, which are not the status codes you would
 * guess. An expired or revoked token comes back **HTTP 400** with "Invalid
 * token"; only a request with no credentials at all gets a 401. Matching on
 * 401 alone would miss every real expiry.
 */
const REFUSAL_MESSAGES = ['invalid token', 'unauthorized'];

export const isAuthRefusal = (message?: string | null): boolean => {
  if (!message) return false;
  const text = message.toLowerCase();
  return REFUSAL_MESSAGES.some((refusal) => text.startsWith(refusal));
};
