import { ReactNode, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import Avatar from '@mui/material/Avatar';

import './PillNav.css';

import Pill from 'components/Pill';
import { NavSection } from 'layout/nav-items';
import { useSlidingIndicator } from 'layout/useSlidingIndicator';
import { User } from 'context/types';
import Logo from '../images/animitchures-logo.svg';

interface Props {
  sections: NavSection[];
  user: User | null;
  onLogout: () => void;
  promo?: ReactNode;
}

type Tab = 'explore' | 'library';

/**
 * The desktop navigation: a fixed 248px column of pills under two big text
 * tabs. Fixed width, no hover expansion — which also retires the rail that
 * swallowed clicks down the left edge of every page.
 */
function PillNav({ sections, user, onLogout, promo }: Props) {
  const items = sections.flatMap((section) => section.items);
  const hasLibrary = items.some((item) => item.group === 'library');
  const [tab, setTab] = useState<Tab>('explore');
  const listRef = useRef<HTMLDivElement>(null);
  const indicator = useSlidingIndicator(listRef, '.pill--active', 'y', [tab]);
  const shown = items.filter((item) => item.group === (hasLibrary ? tab : 'explore'));
  const settings = items.find((item) => item.id === 'settings');
  const login = items.find((item) => item.id === 'login');
  const accountName = user?.displayName || user?.email || 'Account';

  return (
    <nav className="pillNav" aria-label="Main">
      <Link to="/" className="pillNav__brand" aria-label="animitchures home">
        <img src={Logo} alt="" />
        <span>animitchures</span>
      </Link>
      <div className="pillNav__tabs" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'explore'}
          className={tab === 'explore' ? 'is-on' : ''}
          onClick={() => setTab('explore')}
        >
          Explore
        </button>
        {hasLibrary && (
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'library'}
            className={tab === 'library' ? 'is-on' : ''}
            onClick={() => setTab('library')}
          >
            Library
          </button>
        )}
      </div>
      <div className="pillNav__list" ref={listRef}>
        <span
          className={`pillNav__indicator${indicator.visible ? '' : ' is-hidden'}`}
          style={indicator.style}
          aria-hidden="true"
        />
        {shown.map(({ id, label, to, Icon, end }) => (
          <Pill key={id} label={label} to={to} end={end} icon={<Icon />} />
        ))}
        {login && <Pill label={login.label} to={login.to} icon={<login.Icon />} />}
      </div>
      {promo && <div className="pillNav__promo">{promo}</div>}
      {user && (
        <div className="pillNav__account">
          <Link to="/profile" className="pillNav__who" aria-label="Profile">
            {/* src undefined rather than a stringified null, and the initial as
                children: MUI only derives one from alt after a failed load. */}
            <Avatar className="pillNav__avatar" alt={accountName} src={user.photoURL ?? undefined}>
              {accountName.charAt(0).toUpperCase()}
            </Avatar>
            <span className="pillNav__name">{accountName}</span>
          </Link>
          <span className="pillNav__actions">
            {settings && (
              <Link to={settings.to} className="pillNav__small" aria-label="Settings">
                Settings
              </Link>
            )}
            <span aria-hidden="true">·</span>
            <button
              type="button"
              className="pillNav__small pillNav__logout"
              aria-label="Logout"
              onClick={onLogout}
            >
              Log out
            </button>
          </span>
        </div>
      )}
    </nav>
  );
}

export default PillNav;
