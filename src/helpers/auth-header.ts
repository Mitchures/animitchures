import { makeVar } from '@apollo/client';

const TOKEN_KEY = 'token';

/**
 * Whether a token is in the browser, as something components can subscribe to.
 *
 * `hasStoredToken()` reads localStorage, and localStorage does not notify
 * anyone. The reconnect notice is derived from "an AniList profile with no
 * token", so when `hydrateSession` restored a token from Firestore *after* the
 * profile had been dispatched, nothing re-rendered and the notice stayed up for
 * the rest of the session — claiming an expired connection on an account that
 * had just signed in successfully.
 *
 * Writes go through `storeToken` / `clearStoredToken` so the two cannot drift.
 */
export const anilistTokenVar = makeVar<boolean>(!!localStorage.getItem(TOKEN_KEY));

export const authHeader = () => {
  // return authorization header with token.
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    const { token_type, access_token } = JSON.parse(token);
    return { Authorization: `${token_type} ${access_token}` };
  } else return {};
};

/**
 * Whether a request would have carried credentials.
 *
 * The error link needs this to tell two AniList rejections apart: a token we
 * sent and AniList refused means the connection is dead, while no token at all
 * means the account was never linked — which is a normal state with its own UI,
 * not something to warn about.
 */
export const hasStoredToken = (): boolean => !!localStorage.getItem(TOKEN_KEY);

/** Saves a token and tells anything watching. */
export const storeToken = (token: unknown): void => {
  localStorage.setItem(TOKEN_KEY, JSON.stringify(token));
  anilistTokenVar(true);
};

export const clearStoredToken = (): void => {
  localStorage.removeItem(TOKEN_KEY);
  anilistTokenVar(false);
};
