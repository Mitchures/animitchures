import './Header.css';
import Avatar from '@material-ui/core/Avatar';
import { Notifications } from '@mui/icons-material';

import { Link } from 'react-router-dom';
import { useStateValue } from 'context';

import Search from './Search';

function Header() {
  const [{ user }] = useStateValue();

  return (
    <div className="header">
      <div className="header__left">
        <Search />
      </div>
      <div className="header__right">
        {user && (
          <>
            <Link to="/">
              <Notifications />
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
    </div>
  );
}

export default Header;
