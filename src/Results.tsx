import { useEffect } from 'react';
import './Results.css';
import { useStateValue } from 'context';
import { Link } from 'react-router-dom';
import { SEARCH_QUERY, api } from 'utils';

function Results({ location }: any) {
  const [{ results }, dispatch] = useStateValue();
  const search = location.search;
  const params = new URLSearchParams(search);
  const query = params.get('search');

  const getSearchResults = async (searchQuery: string) => {
    const { data } = await api.fetch({
      query: SEARCH_QUERY,
      variables: {
        search: searchQuery,
        type: 'ANIME',
        isAdult: false,
      },
    });

    console.log(data);

    dispatch({
      type: 'set_results',
      results: data.Page.media,
    });
  };

  useEffect(() => {
    if (query) getSearchResults(query);
    return () => {
      dispatch({
        type: 'set_results',
        results: null,
      });
    };
  }, [query]);

  return (
    <div className="results">
      {results?.length > 0 && (
        <div className="results__container">
          {results?.map((mediaItem: any) => (
            <Link
              to={`/anime/${mediaItem.id}/${mediaItem.title.userPreferred
                .replace(/,?[ ]/g, '-')
                .toLowerCase()}`}
              className="results__item"
              key={mediaItem.id}
            >
              <img
                src={
                  mediaItem.coverImage.extraLarge
                    ? mediaItem.coverImage.extraLarge
                    : mediaItem.bannerImage
                }
                alt={mediaItem.title.userPreferred}
              />
              <span className="results__itemLabel">
                <span className="results__itemLabelTitle">
                  {mediaItem.title.english
                    ? mediaItem.title.english
                    : mediaItem.title.userPreferred}
                </span>
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default Results;
