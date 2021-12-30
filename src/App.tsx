import { useEffect } from 'react';
import { BrowserRouter as Router, Switch, Route, Redirect } from 'react-router-dom';

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

import { auth, db } from 'config';
import { useStateValue } from 'context';
import { IUser } from 'context/types';
import { watchlistActions, anilistActions } from 'actions';

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
                watchlistActions.getWatchlist(uid, dispatch);
                // get anilist user if linked.
                if (user.anilistLinked) {
                  anilistActions.getUser(uid, dispatch);
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
        <Switch>
          <Route path="/login" component={Login} />
          <Route path="/sign-up" component={SignUp} />
          <div className="app__container">
            <Navigation />
            <div className="app__body">
              <Header />
              <Route path="/callback" component={Callback} />
              <Route path="/settings" component={Settings} />
              <Route path="/watchlist" component={Watchlist} />
              <Route path="/search/anime" component={Results} />
              <Route path="/anime/:id/:title" component={Details} />
              {user && <Route path="/profile" component={Profile} />}
              <Route exact path="/">
                <Features />
              </Route>
              {/* <Route render={() => <Redirect to="/" />} /> */}
            </div>
          </div>
        </Switch>
      </Router>
    </div>
  );
}

export default App;
