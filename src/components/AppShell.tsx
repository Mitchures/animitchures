import { useState, useEffect, useRef } from 'react';
import { Outlet, useLocation } from 'react-router-dom';

import Header from 'components/Header';
import Navigation from 'components/Navigation';
import MobileMenu from 'components/MobileMenu';
import SearchSpotlight from 'components/SearchSpotlight';
import { getNavSections } from 'components/nav-items';

import { auth } from 'config';
import { useStateValue, ScrollContainerProvider } from 'context';

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

  const sections = getNavSections({ user, anilistUser: anilist_user });
  const handleLogout = () => auth.signOut();

  // Close the menu on navigation, or it covers the page just navigated to.
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  return (
    <div className="app__container">
      <Navigation
        sections={sections}
        user={user}
        onLogout={handleLogout}
        onSearchOpen={() => setSearchOpen(true)}
        searchOpen={searchOpen}
      />
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
