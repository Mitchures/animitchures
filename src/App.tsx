import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { FirebaseError } from 'firebase/app';
import { User as FirebaseUser } from 'firebase/auth';
import { collection, setDoc, doc, getDoc, DocumentSnapshot } from 'firebase/firestore';

import './App.css';

import AppShell from 'layout/AppShell';
import Loader from 'components/Loader';

import Login from 'views/Login';
import SignUp from 'views/SignUp';
import Details from 'features/details/Details';
import Profile from 'views/Profile';
import Features from 'features/discover/Discover';
import Results from 'features/browse/Browse';
import Favorites from 'views/Favorites';
import AnilistWatchlist from 'views/AnilistWatchlist';
import Settings from 'views/Settings';
import Callback from 'views/Callback';
import ComingSoon from 'views/ComingSoon';
import Community from 'views/Community';

import { auth, db } from 'config';
import { useStateValue } from 'context';
import { User, AnilistUser } from 'context/types';
import { getFavorites, getAccessToken } from 'api';

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
      if (authUser) {
        // user has logged in...
        setSignedOut(false);
        const { uid, photoURL, displayName, email } = authUser;
        // check if user already exists in db.
        const docRef = doc(collection(db, 'users'), uid);
        getDoc(docRef)
          .then((docSnapshot: DocumentSnapshot) => {
            if (docSnapshot.exists()) {
              // get existing user data.
              const data = docSnapshot.data();
              if (data) {
                const user = { ...data } as User;
                // update db if any new information exists.
                setDoc(docRef, user).catch((error: FirebaseError) => alert(error.message));
                // get user favorites.
                getFavorites(uid, dispatch);
                // get anilist user if linked.
                if (user.anilistLinked) {
                  // get access token from database and store in local storage.
                  if (!localStorage.getItem('token'))
                    getAccessToken(uid).then((token) =>
                      localStorage.setItem('token', JSON.stringify(token)),
                    );
                  // Get anilist user from database.
                  const anilistDocRef = doc(collection(db, 'anilist'), uid);
                  getDoc(anilistDocRef)
                    .then((docSnapshot: DocumentSnapshot) => {
                      if (docSnapshot.exists()) {
                        const data = docSnapshot.data();
                        if (data) {
                          dispatch({
                            type: 'set_anilist_user',
                            anilist_user: data as AnilistUser,
                          });
                        }
                      }
                    })
                    .catch((error: FirebaseError) => alert(error.message));
                }
                // set current user to existing user.
                dispatch({
                  type: 'login_user',
                  user,
                });
              }
            } else {
              const user = {
                uid,
                displayName,
                photoURL,
                email,
              };
              // save new user to db.
              setDoc(docRef, user).catch((error: FirebaseError) => alert(error.message));
              // set current user to new user.
              dispatch({
                type: 'login_user',
                user,
              });
            }
          })
          .catch((error: FirebaseError) => alert(error.message));
      } else {
        // user has logged out...
        setSignedOut(true);
        dispatch({
          type: 'logout_user',
        });
        // Remove token from localStorage if any.
        localStorage.removeItem('token');
      }
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
              <Route path="/search/anime" element={<Results />} />
              <Route path="/anime/:id/:title" element={<Details />} />
              {/* Private Routes */}
              {user && (
                <>
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/coming-soon" element={<ComingSoon />} />
                  <Route path="/community" element={<Community />} />
                  <Route path="/favorites" element={<Favorites />} />
                  <Route path="/anilist-watchlist" element={<AnilistWatchlist />} />
                  <Route path="/profile" element={<Profile />} />
                </>
              )}
              <Route path="/" element={<Features />} />
              {/* Unknown routes go to root — but only once auth has settled.
                  Redirecting while it is still resolving is what threw signed-in
                  visitors off their own private routes on a refresh. */}
              <Route path="*" element={authSettled ? <Navigate to="/" replace /> : <Loader />} />
            </Route>
          </Routes>
        </AnimatePresence>
      </Router>
    </div>
  );
}

export default App;
