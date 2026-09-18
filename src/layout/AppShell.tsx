import { useState, useEffect, useRef } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useReactiveVar } from '@apollo/client';

import { NotificationsNoneOutlined, SearchRounded } from '@mui/icons-material';

import PillNav from 'layout/PillNav';
import TabBar from 'layout/TabBar';
import Drawer from 'layout/Drawer';
import MobileHeader from 'layout/MobileHeader';
import SearchSpotlight, { SEARCH_SHORTCUT } from 'layout/SearchSpotlight';
import { getNavSections } from 'layout/nav-items';
import IconButton from 'components/IconButton';
import AnilistReconnect from 'components/AnilistReconnect';
import RateLimitNotice from 'components/RateLimitNotice';
import { useAnilistReconnect } from 'features/settings/useAnilistReconnect';
import ThemeToggle from 'features/settings/ThemeToggle';
import { anilistRateLimitedVar } from 'helpers/anilist-rate-limit';

import { auth } from 'config';
import { useStateValue, ScrollContainerProvider } from 'context';
import { usePreferences } from 'features/settings/usePreferences';

/**
 * The signed-in app shell: sidebar + header + routed content.
 * Owns the More drawer's open state, which is deliberately local rather than
 * in the global reducer — the reducer logs every action, and menu toggles
 * would drown the console.
 */
function AppShell() {
  const [{ user, anilist_user }] = useStateValue();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  // Handed to views that animate on scroll — this is the element that scrolls,
  // not the window.
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { preferences } = usePreferences();
  // A refused AniList token breaks every write — progress, list status, AniList
  // settings — from wherever you happen to be, so the warning belongs in the
  // shell rather than on the one page that also loses its content.
  const anilistExpired = useAnilistReconnect();
  // Set by the retry link, cleared by the first response that comes back. Lives
  // in the shell rather than on a page because any query can trip it, including
  // ones firing from the rail or the spotlight.
  const rateLimited = useReactiveVar(anilistRateLimitedVar);
  const landed = useRef(false);

  const sections = getNavSections({ user, anilistUser: anilist_user });
  const handleLogout = () => auth.signOut();

  // Close the menu on navigation, or it covers the page just navigated to.
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  /**
   * Honour the start-page preference once, on arrival.
   *
   * Guarded by a ref rather than by the pathname: without it, clicking
   * Discover would bounce straight back to whatever the preference names,
   * which makes the rail's first item unusable.
   */
  useEffect(() => {
    if (landed.current || !user) return;
    landed.current = true;
    if (location.pathname === '/' && preferences.startPage !== '/') {
      navigate(preferences.startPage, { replace: true });
    }
  }, [user, preferences.startPage, location.pathname, navigate]);

  return (
    <div className="app__container">
      <PillNav sections={sections} user={user} onLogout={handleLogout} />
      <div className="app__body" ref={scrollContainerRef}>
        <MobileHeader onSearch={() => setSearchOpen(true)} />
        {/* Desktop only: search and notifications sit top-right of the page,
            not in the nav — search is an action, not a destination. */}
        <div className="app__topbar">
          <ThemeToggle />
          <IconButton
            label={`Search anime (${SEARCH_SHORTCUT})`}
            onClick={() => setSearchOpen(true)}
            active={searchOpen}
          >
            <SearchRounded />
          </IconButton>
          {user && (
            <IconButton label="Notifications">
              <NotificationsNoneOutlined />
            </IconButton>
          )}
        </div>
        <ScrollContainerProvider value={scrollContainerRef}>
          {(rateLimited || anilistExpired) && (
            <div className="app__notices">
              {rateLimited && <RateLimitNotice />}
              {anilistExpired && <AnilistReconnect variant="banner" />}
            </div>
          )}
          <Outlet />
        </ScrollContainerProvider>
      </div>
      <SearchSpotlight open={searchOpen} onOpenChange={setSearchOpen} />
      <TabBar sections={sections} moreOpen={menuOpen} onMore={() => setMenuOpen((open) => !open)} />
      <Drawer
        open={menuOpen}
        sections={sections}
        user={user}
        onClose={() => setMenuOpen(false)}
        onLogout={handleLogout}
      />
    </div>
  );
}

export default AppShell;
