import { NavLink, Link } from 'react-router-dom';
import Avatar from '@mui/material/Avatar';
import { IoNotifications, IoSearch } from 'react-icons/io5';
import './Navigation.css';

import { NavSection } from 'layout/nav-items';
import { SEARCH_SHORTCUT } from './SearchSpotlight';
import { User } from 'context/types';
import Logo from '../images/animitchures-logo.svg';

interface Props {
  sections: NavSection[];
  user: User | null;
  onLogout: () => void;
  onSearchOpen: () => void;
  searchOpen: boolean;
}

function Navigation({ sections, user, onLogout, onSearchOpen, searchOpen }: Props) {
  // The rail splits the same nav data two ways: destinations in the list,
  // account actions pinned to the footer without their "General" heading.
  // nav-items is left intact because MobileMenu renders all sections as-is.
  const destinations = sections.filter((section) => section.id !== 'general');
  const accountItems = sections.find((section) => section.id === 'general')?.items ?? [];
  // Logout is pulled out so it can sit last, below the profile — it is the exit,
  // so it belongs at the bottom of the stack rather than above your own avatar.
  const logoutItem = accountItems.find((item) => item.isLogout);
  // One label for the avatar's alt and its fallback initial.
  const accountName = user?.displayName || user?.email || 'Account';
  const settingsItems = accountItems.filter((item) => !item.isLogout);

  return (
    <div className="navigation">
      <Link to="/" className="navigation__logo">
        <img src={Logo} alt="animitchures" />
        <span className="navigation__wordmark">
          animitchures<span></span>
        </span>
      </Link>
      {/* The shortcut is a tooltip rather than a visible keycap. */}
      <button
        type="button"
        className={`navigation__action navigation__search${searchOpen ? ' active' : ''}`}
        aria-label="Search anime"
        title={`Search (${SEARCH_SHORTCUT})`}
        onClick={onSearchOpen}
      >
        <div className="navigation__icon">
          <IoSearch />
        </div>
        <span>Search</span>
      </button>
      <div className="navigation__container">
        {destinations.map((section) => (
          <div key={section.id}>
            <h5>{section.heading}</h5>
            <ul>
              {section.items.map(({ id, label, to, Icon, end, isLogout }) => (
                <li key={id}>
                  {/* aria-label is required, not decoration: collapsed to a rail
                      the visible label is hidden, leaving only an icon. */}
                  {isLogout ? (
                    <Link to={to} className="logout" aria-label={label} onClick={onLogout}>
                      <div className="navigation__icon">
                        <Icon />
                      </div>
                      <span>{label}</span>
                    </Link>
                  ) : (
                    <NavLink to={to} end={end} aria-label={label}>
                      <div className="navigation__icon">
                        <Icon />
                      </div>
                      <span>{label}</span>
                    </NavLink>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="navigation__footer">
        {/* A button, not a link: notifications are not built yet, and this
            previously navigated to '/' — which silently took you home. It is
            inert until there is a panel to open. */}
        {user && (
          <button type="button" className="navigation__action" aria-label="Notifications">
            <div className="navigation__icon">
              <IoNotifications />
            </div>
            <span>Notifications</span>
          </button>
        )}
        {settingsItems.map(({ id, label, to, Icon, end }) => (
          <NavLink key={id} to={to} end={end} className="navigation__action" aria-label={label}>
            <div className="navigation__icon">
              <Icon />
            </div>
            <span>{label}</span>
          </NavLink>
        ))}
        {user && (
          <NavLink to="/profile" className="navigation__action" aria-label="Profile">
            {/* src is undefined rather than `${user.photoURL}`, which stringifies
                null into "null" and sends the browser after a file of that name.
                The initial is passed as children because MUI only derives one from
                alt when a src was given and failed to load — which is exactly the
                doomed request being removed here. */}
            <Avatar
              className="navigation__avatar"
              alt={accountName}
              src={user.photoURL ?? undefined}
            >
              {accountName.charAt(0).toUpperCase()}
            </Avatar>
            {/* Labelled by function like every other rail item. The signed-in
                identity is still carried by the avatar's alt text, and the mobile
                overlay spells it out in full. */}
            <span>Profile</span>
          </NavLink>
        )}
        {logoutItem && (
          <Link
            to={logoutItem.to}
            className="navigation__action logout"
            aria-label={logoutItem.label}
            onClick={onLogout}
          >
            <div className="navigation__icon">
              <logoutItem.Icon />
            </div>
            <span>{logoutItem.label}</span>
          </Link>
        )}
      </div>
    </div>
  );
}

export default Navigation;
