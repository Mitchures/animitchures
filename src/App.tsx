import { useEffect } from 'react';
import './App.css';
import Header from 'components/Header';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import Login from 'Login';
import SignUp from 'SignUp';
import { auth } from 'utils';
import { useStateValue } from 'context';
import Features from 'components/Features';

function App() {
  const [, dispatch] = useStateValue();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((authUser) => {
      if (authUser) {
        // user has logged in...
        const { uid, displayName, photoURL, email } = authUser;
        dispatch({
          type: 'set_user',
          user: {
            uid,
            name: displayName,
            photoURL,
            email,
          },
        });
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
