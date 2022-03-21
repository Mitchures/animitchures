import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet, Navigate } from 'react-router-dom';

import './App.css';

import Header from 'components/Header';
import Navigation from 'components/Navigation';
import Features from 'components/Features';

import Login from 'pages/Login';
import SignUp from 'pages/SignUp';
import Details from 'pages/Details';
import Profile from 'pages/Profile';
import Results from 'pages/Results';
import Watchlist from 'pages/Watchlist';
import Settings from 'pages/Settings';
import Callback from 'pages/Callback';
import ComingSoon from 'pages/ComingSoon';
import Community from 'pages/Community';

import { auth, db } from 'config';
import { useStateValue } from 'context';
import { IUser } from 'context/types';
import { getWatchlist } from 'api';

interface IData {
  [key: string]: any;
}

function App() {
  const [{ user }, dispatch] = useStateValue();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((authUser) => {
      if (authUser) {
        // user has logged in...
        const { uid, photoURL, displayName, email } = authUser;
        // check if user already exists in db.
        const docRef = db.collection('users').doc(uid);
        docRef
          .get()
          .then((doc) => {
            if (doc.exists) {
              // get existing user data.
              const data = doc.data();
              if (data) {
                const user = { ...data } as IUser;
                // update db if any new information exists.
                docRef.set(user).catch((error) => alert(error.message));
                // get user watchlist.
                getWatchlist(uid, dispatch);
                // get anilist user if linked.
                if (user.anilistLinked) {
                  const anilistDocRef = db.collection('anilist').doc(uid);
                  anilistDocRef
                    .get()
                    .then((docSnapshot) => {
                      if (docSnapshot.exists) {
                        const data = docSnapshot.data();
                        if (data) {
                          dispatch({
                            type: 'set_anilist_user',
                            anilist_user: data,
                          });
                        }
                      }
                    })
                    .catch((error) => alert(error.message));
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
              docRef.set(user).catch((error) => alert(error.message));
              // set current user to new user.
              dispatch({
                type: 'login_user',
                user,
              });
            }
          })
          .catch((error) => alert(error.message));
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
            <Route path="/settings" element={<Settings />} />
            <Route path="/coming-soon" element={<ComingSoon />} />
            <Route path="/community" element={<Community />} />
            <Route path="/watchlist" element={<Watchlist />} />
            <Route path="/search/anime" element={<Results />} />
            <Route path="/anime/:id/:title" element={<Details />} />
            {user && <Route path="/profile" element={<Profile />} />}
            <Route path="/" element={<Features />} />
            {/* Redirect unknown routes to root */}
            <Route path="*" element={<Navigate to="/" />} />
          </Route>
        </Routes>
      </Router>
    </div>
  );
}

export default App;
