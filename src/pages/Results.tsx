import { useEffect, useState } from 'react';

import './Results.css';

import Card from 'components/Card';

import { useStateValue } from 'context';
import { SEARCH_QUERY } from 'utils';
import { api } from 'api';

function Results({ location }: any) {
  const [{ results, user }, dispatch] = useStateValue();
  const [currentPage, setCurrentPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [querySearched, setQuerySearched] = useState('');
  const search = location.search;
  const params = new URLSearchParams(search);
  const query = params.get('search');

  const getSearchResults = async (searchQuery: string | null, page: number) => {
    console.log('page: ', page);
    const { data } = await api.fetch({
      query: SEARCH_QUERY,
      variables: {
        search: searchQuery,
        sort: 'SEARCH_MATCH',
        type: 'ANIME',
        isAdult: user?.isAdult || false,
        page,
        perPage: 20,
      },
    });

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
    getSearchResults(querySearched, page);
  };

  useEffect(() => {
    if (query) {
      if (query !== querySearched) {
        setQuerySearched(query);
        setCurrentPage(1);
        setHasNextPage(false);
        getSearchResults(query, 1);
      } else {
        setQuerySearched(query);
        getSearchResults(query, currentPage);
      }
    }
    return () => {
      dispatch({
        type: 'set_results',
        results: null,
      });
    };
  }, [query]);

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
