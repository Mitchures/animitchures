import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';

import Header from 'components/Header';
import Navigation from 'components/Navigation';
import MobileMenu from 'components/MobileMenu';
import { getNavSections } from 'components/nav-items';

import { auth } from 'config';
import { useStateValue } from 'context';

/**
 * The signed-in app shell: sidebar + header + routed content.
 * Owns the mobile menu's open state, which is deliberately local rather than
 * in the global reducer — the reducer logs every action, and menu toggles
 * would drown the console.
 */
function AppShell() {
  const [{ user, anilist_user }] = useStateValue();
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  const sections = getNavSections({ user, anilistUser: anilist_user });
  const handleLogout = () => auth.signOut();

  // Close the menu on navigation, or it covers the page just navigated to.
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  return (
    <div className="app__container">
      <Navigation sections={sections} user={user} onLogout={handleLogout} />
      <div className="app__body">
        <Header menuOpen={menuOpen} onMenuToggle={() => setMenuOpen((open) => !open)} />
        <Outlet />
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
