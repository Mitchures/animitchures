import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { User as FirebaseUser } from 'firebase/auth';

import './App.css';

import AppShell from 'layout/AppShell';
import DiscoverSkeleton from 'features/discover/DiscoverSkeleton';

import Login from 'views/Login';
import SignUp from 'views/SignUp';
import Details from 'features/details/Details';
import Profile from 'features/profile/Profile';
import Discover from 'features/discover/Discover';
import Browse from 'features/browse/Browse';
import Favorites from 'views/Favorites';
import Watchlist from 'features/watchlist/Watchlist';
import StaffPage from 'features/people/StaffPage';
import CharacterPage from 'features/people/CharacterPage';
import StudioPage from 'features/studio/StudioPage';
import Taste from 'features/taste/Taste';
import Calendar from 'features/calendar/Calendar';
import Settings from 'features/settings/Settings';
import Callback from 'views/Callback';
import ComingSoon from 'views/ComingSoon';
import Community from 'views/Community';

import { auth } from 'config';
import { useStateValue } from 'context';
import { hydrateSession, clearSession } from 'api';

function App() {
  const [{ user }, dispatch] = useStateValue();
  // Firebase resolves the session asynchronously, so `user` is null on the
  // first render even for a signed-in visitor. Without this the '*' catch-all
  // matched before that resolved and a hard refresh on any private route
  // bounced to '/'.
  const [signedOut, setSignedOut] = useState(false);

  // Settled means routing can be trusted: either Firebase reported no session,
  // or it reported one and the user document has finished loading. Waiting for
  // `user` matters — the private routes are gated on it, so treating "Firebase
  // says signed in" as settled would still lose the race against Firestore.
  const authSettled = signedOut || !!user;

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((authUser: FirebaseUser | null) => {
      if (!authUser) {
        setSignedOut(true);
        clearSession(dispatch);
        return;
      }

      setSignedOut(false);
      // Failures here are logged rather than alerted: every one of them has a
      // fallback on screen, and a modal about a Firestore read is not something
      // anyone can act on.
      hydrateSession(authUser, dispatch).catch((error) =>
        console.error('Could not load your account', error),
      );
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <div className="app">
      <Router>
        <AnimatePresence mode="wait">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/sign-up" element={<SignUp />} />
            <Route element={<AppShell />}>
              <Route path="/callback" element={<Callback />} />
              <Route path="/search/anime" element={<Browse />} />
              <Route path="/anime/:id/:title" element={<Details />} />
              {/* Public: a cast chip should lead somewhere whether or not you
                  are signed in — these were the app's biggest dead ends. */}
              <Route path="/staff/:id/:name" element={<StaffPage />} />
              <Route path="/character/:id/:name" element={<CharacterPage />} />
              <Route path="/studio/:id/:name" element={<StudioPage />} />
              <Route path="/calendar" element={<Calendar />} />
              {/* Private Routes */}
              {user && (
                <>
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/coming-soon" element={<ComingSoon />} />
                  <Route path="/community" element={<Community />} />
                  <Route path="/favorites" element={<Favorites />} />
                  <Route path="/anilist-watchlist" element={<Watchlist />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/taste" element={<Taste />} />
                </>
              )}
              <Route path="/" element={<Discover />} />
              {/* Unknown routes go to root — but only once auth has settled.
                  Redirecting while it is still resolving is what threw signed-in
                  visitors off their own private routes on a refresh. */}
              <Route
                path="*"
                element={authSettled ? <Navigate to="/" replace /> : <DiscoverSkeleton />}
              />
            </Route>
          </Routes>
        </AnimatePresence>
      </Router>
    </div>
  );
}

export default App;
