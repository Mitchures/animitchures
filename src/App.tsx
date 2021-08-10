import { useEffect } from 'react';
import './App.css';
import Header from 'components/Header';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import Login from 'Login';
import SignUp from 'SignUp';
import { auth, db } from 'utils';
import { useStateValue } from 'context';
import Features from 'components/Features';
import Details from 'Details';
import Profile from 'Profile';

function App() {
  const [{ user }, dispatch] = useStateValue();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((authUser) => {
      if (authUser) {
        console.log(authUser.displayName);
        // user has logged in...
        const { uid, displayName, photoURL, email } = authUser;
        dispatch({
          type: 'set_user',
          user: {
            uid,
            displayName,
            photoURL,
            email,
          },
        });
        // Save new info or update database
        db.collection('users')
          .doc(uid)
          .set({
            uid,
            displayName,
            email,
            photoURL,
          })
          .catch((error) => alert(error.message));
      } else {
        // user has logged out...
        dispatch({
          type: 'set_user',
          user: null,
        });
      }
    });

    return () => {
      unsubscribe();
    };
  }, [dispatch]);

  return (
    <div className="app">
      <Router>
        <Header />
        <Switch>
          <Route path="/anime/:id/:title" component={Details} />
          {user && <Route path="/profile" component={Profile} />}
          <Route path="/login" component={Login} />
          <Route path="/sign-up" component={SignUp} />
          <Route path="/">
            <Features />
          </Route>
        </Switch>
      </Router>
    </div>
  );
}

export default App;
