import { useState, useEffect, useRef } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';

import Header from 'layout/Header';
import Navigation from 'layout/Navigation';
import MobileMenu from 'layout/MobileMenu';
import SearchSpotlight, { SEARCH_SHORTCUT } from 'layout/SearchSpotlight';
import SearchFab from 'layout/SearchFab';
import { getNavSections } from 'layout/nav-items';

import { auth } from 'config';
import { useStateValue, ScrollContainerProvider } from 'context';
import { usePreferences } from 'features/settings/usePreferences';

/**
 * The signed-in app shell: sidebar + header + routed content.
 * Owns the mobile menu's open state, which is deliberately local rather than
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
      <Navigation sections={sections} user={user} onLogout={handleLogout} />
      <SearchFab open={searchOpen} onOpen={() => setSearchOpen(true)} shortcut={SEARCH_SHORTCUT} />
      <SearchSpotlight open={searchOpen} onOpenChange={setSearchOpen} />
      <div className="app__body" ref={scrollContainerRef}>
        <Header menuOpen={menuOpen} onMenuToggle={() => setMenuOpen((open) => !open)} />
        <ScrollContainerProvider value={scrollContainerRef}>
          <Outlet />
        </ScrollContainerProvider>
      </div>
      <MobileMenu
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
