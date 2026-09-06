import { IoSearch } from 'react-icons/io5';

import './SearchFab.css';

interface Props {
  onOpen: () => void;
  open: boolean;
  shortcut: string;
}

/**
 * The search trigger, as a floating action button.
 *
 * It used to sit at the top of the rail, which put it inside the navigation —
 * a list of places you can go — even though search is an action, not a
 * destination. Down here it is reachable from any page without the rail
 * needing to be on screen at all, which also makes it work below 960px where
 * the rail is hidden entirely.
 */
function SearchFab({ onOpen, open, shortcut }: Props) {
  return (
    <button
      type="button"
      className={`searchFab${open ? ' active' : ''}`}
      aria-label="Search anime"
      title={`Search (${shortcut})`}
      onClick={onOpen}
    >
      <IoSearch />
    </button>
  );
}

export default SearchFab;
