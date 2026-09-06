import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import { motion } from 'framer-motion';

import './Browse.css';

import Card from 'components/Card';
import Skeleton from 'components/Skeleton';
import FilterBar, { Filters } from 'features/browse/FilterBar';

import { useStateValue } from 'context';
import { Media } from 'graphql/types';
import { SEARCH_QUERY } from 'graphql/queries';

/** Just the shape fetchMore has to merge — not the whole query result. */
type SearchPage = { Page?: { media?: Media[]; pageInfo?: unknown } };

const PER_PAGE = 20;
const SKELETON_COUNT = 12;

/**
 * Browse and search, which are the same query with different arguments.
 *
 * Everything lives in the URL, so a filtered view is shareable, the back button
 * steps through filter changes, and a genre link is just this page with `genre`
 * already set.
 *
 * Results are local rather than in the global store. The old version merged each
 * page into a global `results` array by hand, which meant every other view that could
 * lead here had to remember to clear it first or the previous search's posters
 * were prepended to the next one. Apollo's fetchMore does the appending, so that
 * whole failure mode is gone.
 */
function Results() {
  const [{ user }] = useStateValue();
  const [searchParams, setSearchParams] = useSearchParams();

  const search = searchParams.get('search') ?? '';
  const filters: Filters = {
    genre: searchParams.get('genre') ?? '',
    year: searchParams.get('year') ?? '',
    format: searchParams.get('format') ?? '',
    status: searchParams.get('status') ?? '',
    sort: searchParams.get('sort') ?? '',
  };

  const hasCriteria = Boolean(search) || Object.values(filters).some(Boolean);

  const { data, loading, error, fetchMore } = useQuery(SEARCH_QUERY, {
    variables: {
      type: 'ANIME',
      isAdult: user?.isAdult || false,
      page: 1,
      perPage: PER_PAGE,
      search: search || undefined,
      genres: filters.genre ? [filters.genre] : undefined,
      seasonYear: filters.year ? Number(filters.year) : undefined,
      format: filters.format ? [filters.format] : undefined,
      status: filters.status || undefined,
      // SEARCH_MATCH ranks by how closely a title matches the typed text, which
      // is meaningless when nothing was typed.
      sort: filters.sort || (search ? 'SEARCH_MATCH' : 'POPULARITY_DESC'),
    },
    skip: !hasCriteria,
    notifyOnNetworkStatusChange: true,
  });

  const media: Media[] = data?.Page?.media ?? [];
  const pageInfo = data?.Page?.pageInfo;
  const isFirstLoad = loading && !media.length;

  const update = (next: Partial<Filters>) => {
    const params = new URLSearchParams(searchParams);
    Object.entries(next).forEach(([key, value]) =>
      value ? params.set(key, value) : params.delete(key),
    );
    setSearchParams(params);
  };

  const clear = () => {
    const params = new URLSearchParams();
    // The search term is not a filter — clearing filters should narrow nothing,
    // not throw away what you typed.
    if (search) params.set('search', search);
    setSearchParams(params);
  };

  const loadMore = () =>
    fetchMore({
      variables: { page: (pageInfo?.currentPage ?? 1) + 1 },
      updateQuery: (
        previous: SearchPage,
        { fetchMoreResult }: { fetchMoreResult?: SearchPage },
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

  const heading = search ? `Results for “${search}”` : filters.genre || 'Browse anime';

  // "Try removing one" is useless advice when there is nothing to remove, so the
  // empty state says what would actually help in each case.
  const nothingFound = () => {
    const filtered = Object.values(filters).some(Boolean);
    if (search && filtered)
      return `Nothing matches “${search}” with those filters. Try removing one.`;
    if (filtered) return 'Nothing matches those filters. Try removing one.';
    return `Nothing matches “${search}”. Check the spelling, or try the original Japanese title.`;
  };

  const detail = () => {
    if (isFirstLoad) return 'Searching…';
    if (!hasCriteria) return 'Pick a filter, or search for something.';
    if (!pageInfo?.total) return '';
    return `${pageInfo.total.toLocaleString()} ${pageInfo.total === 1 ? 'title' : 'titles'}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="browse"
    >
      <div className="browse__header">
        <h3>{heading}</h3>
        <p>{detail()}</p>
      </div>

      <FilterBar filters={filters} onChange={update} onClear={clear} />

      {isFirstLoad && (
        <div className="browse__container" aria-hidden="true">
          {Array.from({ length: SKELETON_COUNT }, (_, index) => (
            <Skeleton key={index} className="browse__skeleton" radius="var(--border-radius)" />
          ))}
        </div>
      )}

      {!isFirstLoad && error && (
        <p className="browse__empty">
          Something went wrong loading results. Try again in a moment.
        </p>
      )}

      {!isFirstLoad && !error && hasCriteria && !media.length && (
        <p className="browse__empty">{nothingFound()}</p>
      )}

      {!!media.length && (
        <>
          <div className="browse__container">
            {media.map((item) => (
              <Card key={item.id} {...item} />
            ))}
          </div>
          {pageInfo?.hasNextPage && (
            <button type="button" className="browse__more" onClick={loadMore} disabled={loading}>
              {loading ? 'Loading…' : 'Load more'}
            </button>
          )}
        </>
      )}
    </motion.div>
  );
}

export default Results;
