import './Header.css';
import { Menu as MenuIcon } from '@mui/icons-material';

import { Link } from 'react-router-dom';

import Wordmark from '../images/animitchures-logo-with-text-480.png';

interface Props {
  menuOpen: boolean;
  onMenuToggle: () => void;
}

/**
 * The mobile-only top bar: logo and the menu button, nothing else.
 *
 * It used to carry an inline search field as well, from back when the rail's
 * spotlight trigger vanished along with the rail below 960px. The trigger is a
 * FAB now and survives at every width, so the header field was a second, worse
 * way to do the same thing — no live results, and it navigated on submit only.
 *
 * Losing the field freed enough width for the full lockup rather than the bare
 * mark, which is the one place in the app the wordmark is shown as artwork —
 * the rail sets its own in Montserrat, since it has to appear and disappear
 * with the hover expansion and type can do that without a second asset.
 */
function Header({ menuOpen, onMenuToggle }: Props) {
  return (
    <div className="header">
      <Link to="/" className="header__mark" aria-label="animitchures home">
        <img src={Wordmark} alt="animitchures" />
      </Link>
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
