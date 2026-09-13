import { ApolloClient, ApolloLink, createHttpLink, InMemoryCache, from } from '@apollo/client';
import { onError } from '@apollo/client/link/error';
import { RetryLink } from '@apollo/client/link/retry';

import { nameLanguageVar, titleField } from 'helpers/title-language';
import { isAuthRefusal, markAnilistTokenRefused } from 'helpers/anilist-session';
import { hasStoredToken } from 'helpers/auth-header';
import {
  MAX_RETRY_ATTEMPTS,
  clearRateLimited,
  isRateLimited,
  markRateLimited,
  retryDelayMs,
} from 'helpers/anilist-rate-limit';

/** A GraphQL error body, wherever it surfaced. */
type MaybeErrorBody = { errors?: { message?: string | null }[] };

/**
 * AniList reports a refused token in two different places depending on how
 * Apollo classified the response, so both are read.
 *
 * An expired or revoked token comes back as **HTTP 400** carrying a normal
 * GraphQL error body. Apollo treats a non-2xx as a network error and hangs the
 * parsed body off `networkError.result`, so the message is not in
 * `graphQLErrors` where you would look for it first.
 */
const errorLink = onError(({ graphQLErrors, networkError, operation }) => {
  const fromNetwork =
    (networkError as (Error & { result?: MaybeErrorBody }) | undefined)?.result?.errors ?? [];
  const messages = [...(graphQLErrors ?? []), ...fromNetwork].map((error) => error?.message);

  // Only a token we actually sent and AniList refused means the connection is
  // dead. The same "Unauthorized." comes back when no credentials were sent at
  // all, which is the ordinary state of an account that never linked AniList —
  // warning those people that their connection expired would be a lie.
  if (hasStoredToken() && messages.some(isAuthRefusal)) {
    console.warn(`[AniList] token refused on ${operation.operationName}; clearing it`);
    markAnilistTokenRefused();
  }

  if (graphQLErrors) {
    graphQLErrors.map(({ message, locations, path }) =>
      console.log(`[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`),
    );
  }
  if (networkError) {
    // A 429 reaching here has already been retried to exhaustion, so say so
    // rather than leaving a bare ServerParseError about an unexpected '<'.
    if (isRateLimited(networkError)) {
      console.warn(
        `[AniList] still rate limited after ${MAX_RETRY_ATTEMPTS} retries on ` +
          `${operation.operationName}; AniList allows 30 requests a minute`,
      );
    }
    console.log(`[Network error]: ${networkError}`);
  }
});

/**
 * Retries a 429, and only a 429.
 *
 * AniList's budget is 30 requests a minute and a page that trips it used to
 * render empty for good: Apollo's default `errorPolicy` drops the response, so
 * there was no data, no retry and nothing on screen saying why. Waiting a
 * couple of seconds and asking again is almost always enough.
 *
 * Narrow on purpose. A 400 is how AniList reports a refused token — retrying it
 * would delay the reconnect prompt and could never succeed — and a 500 is not
 * ours to retry into.
 */
const retryLink = new RetryLink({
  delay: (count, _operation, error) => retryDelayMs(count, error),
  attempts: (count, _operation, error) => {
    if (!isRateLimited(error)) return false;
    // Raising the banner here rather than in the error link is deliberate: the
    // error link only sees the failure after every retry is spent, by which
    // point the reader has been staring at a half-loaded page for half a minute.
    markRateLimited();
    return count <= MAX_RETRY_ATTEMPTS;
  },
});

/**
 * Drops the rate-limit notice the moment anything comes back.
 *
 * A response arriving at all is proof the window reopened, so this is a more
 * honest signal than a timer counting down to when we guess it might have.
 */
const rateLimitRecoveryLink = new ApolloLink((operation, forward) =>
  forward(operation).map((result) => {
    clearRateLimited();
    return result;
  }),
);

const httpLink = createHttpLink({
  uri: 'https://graphql.anilist.co',
});

/**
 * `userPreferred` is resolved locally rather than taken at face value.
 *
 * AniList decides `userPreferred` from the *authenticated account's* setting,
 * so a visitor who has not linked an account silently gets romaji with no way
 * to change it. Reading the field through a policy means the app's own
 * preference decides, every existing `title.userPreferred` call site keeps
 * working, and the choice costs one change rather than forty-six.
 *
 * The query already asks for every variant, so nothing extra is fetched.
 */
const cache = new InMemoryCache({
  typePolicies: {
    MediaTitle: {
      fields: {
        userPreferred: {
          read(existing, { readField }) {
            // Fall back when a title has no entry in the chosen language —
            // plenty have no English title at all.
            return readField<string>(titleField()) ?? existing;
          },
        },
      },
    },
    StaffName: {
      fields: {
        userPreferred: {
          read(existing, { readField }) {
            if (nameLanguageVar() !== 'NATIVE') return existing;
            return readField<string>('native') ?? existing;
          },
        },
      },
    },
    CharacterName: {
      fields: {
        userPreferred: {
          read(existing, { readField }) {
            if (nameLanguageVar() !== 'NATIVE') return existing;
            return readField<string>('native') ?? existing;
          },
        },
      },
    },
  },
});

const apolloClient = new ApolloClient({
  // Order matters. `retryLink` sits below `errorLink` so the error link sees a
  // 429 only once the retries are spent — otherwise it would log every attempt
  // and the token-refusal check would run four times for one request.
  link: from([errorLink, rateLimitRecoveryLink, retryLink, httpLink]),
  cache,
});

export { apolloClient };
