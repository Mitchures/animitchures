import React, { useState, useEffect } from 'react';
import { Search as SearchIcon } from '@mui/icons-material';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { useStateValue } from 'context';
import './Search.css';

function Search() {
  const [, dispatch] = useStateValue();
  const [input, setInput] = useState<string>('');
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    console.log(input);

    // clear results before search.
    dispatch({
      type: 'set_results',
      results: null,
    });

    setSearchParams({ search: input });

    navigate(`/search/anime?search=${input}`);
  };

  useEffect(() => {
    const query = searchParams.get('search');
    if (searchParams && query) setInput(query);
    return () => {
      if (input.length > 0) setInput('');
    };
  }, [location]);

  return (
    <div className="search">
      <form onSubmit={handleSubmit}>
        <SearchIcon />
        <input onChange={(e) => setInput(e.target.value)} value={input} placeholder={`Search...`} />
        <button type="submit"></button>
      </form>
    </div>
  );
}

export default Search;
