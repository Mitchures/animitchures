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
import { auth } from 'config';
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
            <NavLink to="/">
              <div className="navigation__icon">
                <Explore />
              </div>
              <span>Discover</span>
            </NavLink>
          </li>
          {user && (
            <li>
              <NavLink to="/watchlist">
                <div className="navigation__icon">
                  <Favorite />
                </div>
                <span>Watchlist</span>
              </NavLink>
            </li>
          )}
          <li>
            <NavLink to="/coming-soon">
              <div className="navigation__icon">
                <CalendarToday />
              </div>
              <span>Coming Soon</span>
            </NavLink>
          </li>
        </ul>
        <h5>Social</h5>
        <ul>
          <li>
            <NavLink to="/community">
              <div className="navigation__icon">
                <Groups />
              </div>
              <span>Community</span>
            </NavLink>
          </li>
        </ul>
        <h5>General</h5>
        <ul>
          <li>
            <NavLink to="/settings">
              <div className="navigation__icon">
                <Settings />
              </div>
              <span>Settings</span>
            </NavLink>
          </li>
          {user ? (
            <li>
              <Link to="/" className="logout" onClick={logout}>
                <div className="navigation__icon">
                  <Logout />
                </div>
                <span>Logout</span>
              </Link>
            </li>
          ) : (
            <li>
              <Link to="/login">
                <div className="navigation__icon">
                  <Login />
                </div>
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
