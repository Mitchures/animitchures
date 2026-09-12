import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signInWithPopup, signInWithEmailAndPassword, AuthProvider } from 'firebase/auth';

import { auth } from 'config';
import { useInput } from 'utils/hooks';

import AuthShell from './AuthShell';
import AuthProviders from './AuthProviders';
import PasswordField from './PasswordField';
import { authErrorMessage } from './auth-error';

function Login() {
  const email = useInput('');
  const password = useInput('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const signInWithProvider = async (provider: AuthProvider) => {
    setError('');
    setBusy(true);
    try {
      await signInWithPopup(auth, provider);
      navigate('/');
    } catch (caught) {
      // Closing the popup is a decision, not a failure — authErrorMessage
      // returns an empty string for it, and an empty string renders nothing.
      setError(authErrorMessage(caught));
      setBusy(false);
    }
  };

  // onSubmit, not the button's onClick. With the handler on the button the
  // Enter key fell through to the browser's default submit, which reloaded the
  // page with the credentials in the query string.
  const signIn = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (busy) return;

    if (!email.value || !password.value) {
      setError('Enter your email and password.');
      return;
    }

    setError('');
    setBusy(true);
    try {
      await signInWithEmailAndPassword(auth, email.value, password.value);
      navigate('/');
    } catch (caught) {
      setError(authErrorMessage(caught));
      setBusy(false);
    }
  };

  return (
    <AuthShell title="Welcome back" subtitle="Pick up where you left off.">
      <form className="auth__form" onSubmit={signIn} noValidate>
        {error && (
          <p className="auth__error" role="alert">
            {error}
          </p>
        )}

        <div className="auth__field">
          <label htmlFor="login-email">Email</label>
          <input
            id="login-email"
            type="email"
            autoComplete="email"
            value={email.value}
            onChange={email.onChange}
          />
        </div>

        <PasswordField
          id="login-password"
          label="Password"
          autoComplete="current-password"
          value={password.value}
          onChange={password.onChange}
        />

        <Link className="auth__forgot" to="/login">
          Forgot password?
        </Link>

        <button type="submit" className="auth__submit" disabled={busy}>
          {busy ? 'Signing in…' : 'Sign in'}
        </button>

        <AuthProviders onChoose={signInWithProvider} busy={busy} />

        <p className="auth__alt">
          New here? <Link to="/sign-up">Create an account</Link>
        </p>
      </form>
    </AuthShell>
  );
}

export default Login;
