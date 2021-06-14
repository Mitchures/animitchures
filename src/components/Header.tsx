import './Header.css';
import Logo from '../images/animitch-logo.svg';
import Avatar from '@material-ui/core/Avatar';

import { Link } from 'react-router-dom';
import { useStateValue } from 'context';

function Header() {
  const [{ user }] = useStateValue();

  return (
    <div className="header">
      <div className="header__left">
        <Link to="/">
          <img src={Logo} alt="animitchure" />
          <h2>animitchures</h2>
        </Link>
      </div>
      <div className="header__right">
        {user ? (
          <Avatar className="header__avatar" alt={user.name} src={user.photoURL} />
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/sign-up">Sign Up</Link>
          </>
        )}
      </div>
    </div>
  );
}

export default Header;
