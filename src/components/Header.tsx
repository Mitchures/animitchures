import './Header.css';
import Avatar from '@material-ui/core/Avatar';
import { IoNotifications } from 'react-icons/io5';
import { Menu as MenuIcon } from '@mui/icons-material';

import { Link } from 'react-router-dom';
import { useStateValue } from 'context';

import Search from './Search';
import Logo from '../images/animitchures-logo.svg';

interface Props {
  menuOpen: boolean;
  onMenuToggle: () => void;
}

function Header({ menuOpen, onMenuToggle }: Props) {
  const [{ user }] = useStateValue();

  return (
    <div className="header">
      <Link to="/" className="header__mark" aria-label="animitchures home">
        <img src={Logo} alt="animitchures" />
      </Link>
      <div className="header__left">
        <Search />
      </div>
      <div className="header__right">
        {user && (
          <>
            <Link to="/">
              <IoNotifications />
            </Link>
            <Link to="/profile">
              <Avatar
                className="header__avatar"
                alt={`${user.displayName ? user.displayName : user.email}`}
                src={`${user.photoURL}`}
              />
              <span>{user.displayName ? user.displayName : user.email}</span>
            </Link>
          </>
        )}
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
