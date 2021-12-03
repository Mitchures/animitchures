import { NavLink, Link } from 'react-router-dom';
import {
  Explore,
  Favorite,
  CalendarToday,
  Settings,
  Groups,
  Logout,
  Login,
} from '@mui/icons-material';
import './Navigation.css';
import { auth } from 'utils';
import { useStateValue } from 'context';

function Navigation() {
  const [{ user }] = useStateValue();

  const logout = () => {
    auth.signOut();
  };

  return (
    <div className="navigation">
      <Link to="/" className="navigation__logo">
        animitchures<span>.</span>
      </Link>
      <div className="navigation__container">
        <h5>Menu</h5>
        <ul>
          <li>
            <NavLink exact to="/">
              <Explore />
              <span>Discover</span>
            </NavLink>
          </li>
          {user && (
            <li>
              <NavLink to="/watchlist">
                <Favorite />
                <span>Watchlist</span>
              </NavLink>
            </li>
          )}
          <li>
            <NavLink to="/coming-soon">
              <CalendarToday />
              <span>Coming Soon</span>
            </NavLink>
          </li>
        </ul>
        <h5>Social</h5>
        <ul>
          <li>
            <NavLink to="/community">
              <Groups />
              <span>Community</span>
            </NavLink>
          </li>
        </ul>
        <h5>General</h5>
        <ul>
          <li>
            <NavLink to="/settings">
              <Settings />
              <span>Settings</span>
            </NavLink>
          </li>
          {user ? (
            <li>
              <Link to="/" className="logout" onClick={logout}>
                <Logout />
                <span>Logout</span>
              </Link>
            </li>
          ) : (
            <li>
              <Link to="/login">
                <Login />
                <span>Login</span>
              </Link>
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}

export default Navigation;
