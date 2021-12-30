import { useState } from 'react';
import firebase from 'firebase';
import { Link, useHistory } from 'react-router-dom';

import './Login.css';

import { auth, appleProvider, googleProvider } from 'config';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const history = useHistory();

  const signInWithProvider = (provider: firebase.auth.AuthProvider) => {
    auth
      .signInWithPopup(provider)
      .then(({ user }) => {
        history.push('/');
      })
      .catch((error) => alert(error.message));
  };

  const signIn = (event: { preventDefault: () => void } | any) => {
    event?.preventDefault();

    if (email && password) {
      auth
        .signInWithEmailAndPassword(email, password)
        .then(({ user }) => {
          history.push('/');
        })
        .catch((error) => alert(error.message));
    }
  };

  return (
    <div className="login">
      <div className="login__left">
        <div className="login__header">
          <Link to="/">
            animitchures<span>.</span>
          </Link>
        </div>
        <div className="login__container">
          <div className="login__formContainer">
            <h1>Login</h1>
            <form className="login__form">
              <div>
                <label htmlFor="login-username">Email</label>
                <input
                  type="text"
                  id="login-username"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="login-password">Password</label>
                <input
                  type="password"
                  id="login-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <button type="submit" onClick={signIn}>
                Sign in
              </button>
            </form>
            <hr />
            <button
              type="button"
              className="login__withApple"
              onClick={() => signInWithProvider(appleProvider)}
            >
              <div>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  xmlnsXlink="http://www.w3.org/1999/xlink"
                  viewBox="0 0 512 512"
                >
                  <path d="M349.13 136.86c-40.32 0-57.36 19.24-85.44 19.24c-28.79 0-50.75-19.1-85.69-19.1c-34.2 0-70.67 20.88-93.83 56.45c-32.52 50.16-27 144.63 25.67 225.11c18.84 28.81 44 61.12 77 61.47h.6c28.68 0 37.2-18.78 76.67-19h.6c38.88 0 46.68 18.89 75.24 18.89h.6c33-.35 59.51-36.15 78.35-64.85c13.56-20.64 18.6-31 29-54.35c-76.19-28.92-88.43-136.93-13.08-178.34c-23-28.8-55.32-45.48-85.79-45.48z"></path>
                  <path d="M340.25 32c-24 1.63-52 16.91-68.4 36.86c-14.88 18.08-27.12 44.9-22.32 70.91h1.92c25.56 0 51.72-15.39 67-35.11c14.72-18.77 25.88-45.37 21.8-72.66z"></path>
                </svg>
                <span>Continue with Apple</span>
              </div>
            </button>
            <button
              type="button"
              className="login__withGoogle"
              onClick={() => signInWithProvider(googleProvider)}
            >
              <div>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  xmlnsXlink="http://www.w3.org/1999/xlink"
                  viewBox="0 0 48 48"
                >
                  <defs>
                    <path
                      id="a"
                      d="M44.5 20H24v8.5h11.8C34.7 33.9 30.1 37 24 37c-7.2 0-13-5.8-13-13s5.8-13 13-13c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 4.1 29.6 2 24 2 11.8 2 2 11.8 2 24s9.8 22 22 22c11 0 21-8 21-22 0-1.3-.2-2.7-.5-4z"
                    />
                  </defs>
                  <clipPath id="b">
                    <use xlinkHref="#a" overflow="visible" />
                  </clipPath>
                  <path clipPath="url(#b)" fill="#FBBC05" d="M0 37V11l17 13z" />
                  <path clipPath="url(#b)" fill="#EA4335" d="M0 11l17 13 7-6.1L48 14V0H0z" />
                  <path clipPath="url(#b)" fill="#34A853" d="M0 37l30-23 7.9 1L48 0v48H0z" />
                  <path clipPath="url(#b)" fill="#4285F4" d="M48 48L17 24l-4-3 35-10z" />
                </svg>
                <span>Continue with Google</span>
              </div>
            </button>
            <p>
              Don't have an account ? <Link to="/sign-up">Sign up</Link>
            </p>
          </div>
        </div>
      </div>
      <div className="login__right"></div>
    </div>
  );
}

export default Login;
