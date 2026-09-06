import { ApolloClient, createHttpLink, InMemoryCache, from } from '@apollo/client';
import { onError } from '@apollo/client/link/error';

import { nameLanguageVar, titleField } from 'helpers/title-language';

const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors) {
    graphQLErrors.map(({ message, locations, path }) =>
      console.log(`[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`),
    );
  }
  if (networkError) console.log(`[Network error]: ${networkError}`);
});

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
  link: from([errorLink, httpLink]),
  cache,
});

export { apolloClient };
