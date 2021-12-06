import React, { useState, useEffect } from 'react';
import { Search as SearchIcon } from '@mui/icons-material';
import './Search.css';
import { useHistory, useLocation } from 'react-router-dom';

function Search() {
  const [input, setInput] = useState<string>('');
  const history = useHistory();
  const location = useLocation();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    console.log(input);

    history.push(`/search/anime?search=${input}`);
  };

  useEffect(() => {
    //TODO: this seems weird, probably should fix
    const search = location.search;
    const params = new URLSearchParams(search);
    const query = params.get('search');

    if (search && query) setInput(query);

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
