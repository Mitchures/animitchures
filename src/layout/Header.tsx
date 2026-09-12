import './Header.css';
import { Menu as MenuIcon } from '@mui/icons-material';

import { Link } from 'react-router-dom';

import Logo from '../images/animitchures-logo.svg';

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
 * Losing the field freed enough width for the lockup rather than the bare mark.
 * The wordmark is live text, as it is in the rail and on the login page — one
 * SVG for the mark and no raster artwork anywhere.
 */
function Header({ menuOpen, onMenuToggle }: Props) {
  return (
    <div className="header">
      <Link to="/" className="header__mark" aria-label="animitchures home">
        <img src={Logo} alt="" />
        <span>animitchures</span>
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
