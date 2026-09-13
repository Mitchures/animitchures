import { useEffect } from 'react';
import { useQuery } from '@apollo/client';
import { motion } from 'framer-motion';

import './Favorites.css';

import Card from 'components/Card';
import PosterGridSkeleton from 'components/PosterGridSkeleton';

import { useStateValue } from 'context';
import { Media } from 'graphql/types';
import { DETAILS_LIST_QUERY } from 'graphql/queries';

/**
 * AniList's ceiling for `perPage`. This was 15, which turned a 52-title list
 * into four round trips — each waiting on the one before — against a budget of
 * 30 requests a minute. At 50 the same list costs two.
 *
 * The e2e fixture holds three favourites and reports `hasNextPage: false`, so no
 * test ever walked the paging path; it took simulating a real list to see it.
 */
const PER_PAGE = 50;

/** Just the shape fetchMore has to merge — not the whole query result. */
type FavoritesPage = {
  Page?: { media?: Media[]; pageInfo?: { currentPage: number; hasNextPage: boolean } };
};

const getSortedMedia = (list: Media[]) => {
  // Copied before sorting because the entries below are mutated, and the array
  // comes straight from Apollo's cache — sorting it in place would reorder the
  // cache itself. `structuredClone` replaces lodash's cloneDeep: lodash was in
  // the bundle for this one call, and carries a code-injection advisory in
  // `_.template` with no fixed release to upgrade to.
  const media: Media[] = structuredClone(list);
  media.forEach((item: Media) => {
    if (item.title && !item.title.english) {
      item.title.english = item.title.userPreferred;
    }
  });
  media.sort((a: Media, b: Media) => {
    if (a.title?.english && b.title?.english) {
      return a.title.english.localeCompare(b.title.english);
    }
    return 0;
  });
  return media;
};

function Favorites() {
  const [{ favorites }] = useStateValue();

  /**
   * Apollo accumulates the pages, rather than a local array built up in an
   * effect. The previous version appended each response into component state,
   * which meant two ways to show the wrong thing: the reducer rebuilds
   * `favorites` on every dispatch, so re-setting the same list restarted the
   * whole paged fetch, and each restart appended a second copy of every title
   * onto what was already on screen. Deep-equal variables make a repeat dispatch
   * free, and `fetchMore` owns the merging.
   */
  const { loading, data, fetchMore } = useQuery(DETAILS_LIST_QUERY, {
    variables: { id_in: favorites, type: 'ANIME', page: 1, perPage: PER_PAGE },
    skip: favorites.length === 0,
    notifyOnNetworkStatusChange: true,
  });

  const media: Media[] = data?.Page?.media ?? [];
  const pageInfo = data?.Page?.pageInfo;
  const hasMore = Boolean(pageInfo?.hasNextPage);

  // Everything on one screen, so the next page is pulled as soon as a response
  // says there is one rather than waiting for a scroll.
  useEffect(() => {
    if (!hasMore || loading) return;

    fetchMore({
      variables: { page: (pageInfo?.currentPage ?? 1) + 1 },
      updateQuery: (
        previous: FavoritesPage,
        { fetchMoreResult }: { fetchMoreResult?: FavoritesPage },
      ) => {
        if (!fetchMoreResult) return previous;
        return {
          Page: {
            ...fetchMoreResult.Page,
            media: [...(previous?.Page?.media ?? []), ...(fetchMoreResult.Page?.media ?? [])],
          },
        };
      },
    });
  }, [hasMore, loading, pageInfo?.currentPage, fetchMore]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="favorites"
    >
      {favorites.length === 0 ? (
        // An empty list is not a loading state. It was wearing the loader —
        // spinner and all — which told you to wait for something that was
        // never coming.
        <p className="favorites__empty">
          No favourites yet. Tap the heart on any title and it lands here.
        </p>
      ) : media.length === 0 ? (
        <PosterGridSkeleton
          gridClassName="favorites__grid"
          count={Math.min(favorites.length, PER_PAGE)}
        />
      ) : (
        <div className="favorites__grid">
          {getSortedMedia(media).map((mediaItem: Media) => (
            <Card key={mediaItem.id} {...mediaItem} />
          ))}
        </div>
      )}
    </motion.div>
  );
}

export default Favorites;
