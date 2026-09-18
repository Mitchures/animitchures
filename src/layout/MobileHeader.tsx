import { Link } from 'react-router-dom';
import { SearchRounded } from '@mui/icons-material';
import Avatar from '@mui/material/Avatar';

import './MobileHeader.css';

import IconButton from 'components/IconButton';
import ThemeToggle from 'features/settings/ThemeToggle';
import { useStateValue } from 'context';
import Logo from '../images/animitchures-logo.svg';

/** Below 960px: brand lockup, search, and the avatar (or Log in). Nothing else. */
function MobileHeader({ onSearch }: { onSearch: () => void }) {
  const [{ user }] = useStateValue();
  const name = user?.displayName || user?.email || 'Account';

  return (
    <div className="mobileHeader">
      <Link to="/" className="mobileHeader__brand" aria-label="animitchures home">
        <img src={Logo} alt="" />
        <span>animitchures</span>
      </Link>
      <div className="mobileHeader__actions">
        <ThemeToggle />
        <IconButton label="Search anime" onClick={onSearch}>
          <SearchRounded />
        </IconButton>
        {user ? (
          <Link to="/profile" aria-label="Profile" className="mobileHeader__avatar">
            <Avatar alt={name} src={user.photoURL ?? undefined}>
              {name.charAt(0).toUpperCase()}
            </Avatar>
          </Link>
        ) : (
          <Link to="/login" className="mobileHeader__login">
            Log in
          </Link>
        )}
      </div>
    </div>
  );
}

export default MobileHeader;
