import { useEffect } from 'react';
import './App.css';
import Header from 'components/Header';
import { BrowserRouter as Router, Switch, Route, Redirect } from 'react-router-dom';
import Login from 'Login';
import SignUp from 'SignUp';
import { auth, db } from 'config';
import { useStateValue } from 'context';
import { getWatchlist, anilistActions } from 'actions';
import Features from 'components/Features';
import Details from 'Details';
import Profile from 'Profile';
import Navigation from 'components/Navigation';
import Results from 'Results';
import Watchlist from 'Watchlist';
import Settings from 'Settings';
import Callback from 'Callback';

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
                const user: any = { ...data };
                // update db if any new information exists.
                docRef.set(user).catch((error) => alert(error.message));
                // get user watchlist.
                getWatchlist(uid, dispatch);
                // get anilist account if linked.
                if (user.anilistLinked) {
                  anilistActions.getAccount(uid, dispatch);
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
