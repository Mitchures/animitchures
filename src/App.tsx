import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { FirebaseError } from 'firebase/app';
import { collection, setDoc, doc, getDoc, DocumentSnapshot } from 'firebase/firestore';

import './App.css';

import Header from 'components/Header';
import Navigation from 'components/Navigation';

import Login from 'views/Login';
import SignUp from 'views/SignUp';
import Details from 'views/Details';
import Profile from 'views/Profile';
import Features from 'views/Features';
import Results from 'views/Results';
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

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((authUser: any) => {
      if (authUser) {
        // user has logged in...
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
        <AnimatePresence exitBeforeEnter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/sign-up" element={<SignUp />} />
            <Route
              element={
                <div className="app__container">
                  <Navigation />
                  <div className="app__body">
                    <Header />
                    <Outlet />
                  </div>
                </div>
              }
            >
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
              {/* Redirect unknown routes to root */}
              <Route path="*" element={<Navigate to="/" />} />
            </Route>
          </Routes>
        </AnimatePresence>
      </Router>
    </div>
  );
}

export default App;
