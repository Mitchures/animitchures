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
  const [currentPage, setCurrentPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [querySearched, setQuerySearched] = useState('');
  const { data, refetch } = useQuery(SEARCH_QUERY, {
    variables: {
      search: querySearched,
      sort: 'SEARCH_MATCH',
      type: 'ANIME',
      isAdult: user?.isAdult || false,
      page: currentPage,
      perPage: 20,
    },
    notifyOnNetworkStatusChange: true,
    skip: !query,
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
  }, [query]);

  useEffect(() => {
    if (data) {
      getSearchResults();
    }
  }, [data]);

  return (
    <div className="results">
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
