import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useQuery } from '@apollo/client';

import './Results.css';

import Card from 'components/Card';

import { useStateValue } from 'context';
import { SEARCH_QUERY } from 'graphql/queries';

// TODO: search logic still needs fixing.
function Results() {
  const [{ results, user }, dispatch] = useStateValue();
  const location = useLocation();
  const search = location.search;
  const params = new URLSearchParams(search);
  const query = params.get('search');
  // Browsing a genre is the same query with a different filter, so it lands
  // here rather than in a view of its own.
  const genre = params.get('genre');
  const [currentPage, setCurrentPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [querySearched, setQuerySearched] = useState('');
  const { data, refetch } = useQuery(SEARCH_QUERY, {
    variables: {
      search: querySearched || undefined,
      genres: genre ? [genre] : undefined,
      // SEARCH_MATCH ranks by how well a title matches the typed text, which is
      // meaningless when nothing was typed.
      sort: genre && !query ? 'POPULARITY_DESC' : 'SEARCH_MATCH',
      type: 'ANIME',
      isAdult: user?.isAdult || false,
      page: currentPage,
      perPage: 20,
    },
    notifyOnNetworkStatusChange: true,
    skip: !query && !genre,
  });

  const getSearchResults = () => {
    console.log('media', data.Page.media);
    console.log('pageInfo', data.Page.pageInfo);

    setCurrentPage(data.Page.pageInfo.currentPage);
    setHasNextPage(data.Page.pageInfo.hasNextPage);

    let mergedResults;
    if (results && results.length > 0) {
      mergedResults = [...(results as any), ...data.Page.media];
    } else {
      mergedResults = data.Page.media;
    }

    dispatch({
      type: 'set_results',
      results: mergedResults,
    });
  };

  const loadMore = (page: number) => {
    setCurrentPage(page);
    refetch();
  };

  // Switching genre keeps the same (empty) search term, so paging has to be
  // reset here or page 3 of the last genre is requested for the new one.
  useEffect(() => {
    setCurrentPage(1);
    setHasNextPage(false);
  }, [genre]);

  useEffect(() => {
    if (query) {
      if (query !== querySearched) {
        setQuerySearched(query);
        setCurrentPage(1);
        setHasNextPage(false);
        refetch();
      } else {
        setQuerySearched(query);
      }
    }

    return () => {
      dispatch({
        type: 'set_results',
        results: null,
      });
    };
  }, [query, genre]);

  useEffect(() => {
    if (data) {
      getSearchResults();
    }
  }, [data]);

  return (
    <div className="results">
      {genre && <h3 className="results__heading">{genre}</h3>}
      {results && results?.length > 0 && (
        <>
          <div className="results__container">
            {results.map((mediaItem: any) => (
              <Card key={mediaItem.id} {...mediaItem} />
            ))}
          </div>
          {hasNextPage && (
            <button onClick={() => loadMore(hasNextPage ? currentPage + 1 : currentPage)}>
              Load more...
            </button>
          )}
        </>
      )}
    </div>
  );
}

export default Results;
