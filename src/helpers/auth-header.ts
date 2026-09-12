const TOKEN_KEY = 'token';

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

export const clearStoredToken = (): void => localStorage.removeItem(TOKEN_KEY);
