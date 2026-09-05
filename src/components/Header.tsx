import './Header.css';
import { Menu as MenuIcon } from '@mui/icons-material';

import { Link } from 'react-router-dom';

import Search from './Search';
import Logo from '../images/animitchures-logo.svg';

interface Props {
  menuOpen: boolean;
  onMenuToggle: () => void;
}

function Header({ menuOpen, onMenuToggle }: Props) {
  return (
    <div className="header">
      <Link to="/" className="header__mark" aria-label="animitchures home">
        <img src={Logo} alt="animitchures" />
      </Link>
      <div className="header__left">
        <Search />
      </div>
      <button
        type="button"
        className="header__menuButton"
        aria-label="Open menu"
        aria-expanded={menuOpen}
        aria-controls="mobile-menu"
        onClick={onMenuToggle}
      >
        <MenuIcon />
      </button>
    </div>
  );
}

export default Header;
