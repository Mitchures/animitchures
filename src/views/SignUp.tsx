import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  createUserWithEmailAndPassword,
  signInWithPopup,
  updateProfile,
  AuthProvider,
} from 'firebase/auth';

import { auth } from 'config';
import { useInput } from 'utils/hooks';

import AuthShell from './AuthShell';
import AuthProviders from './AuthProviders';
import PasswordField from './PasswordField';
import { authErrorMessage } from './auth-error';

function SignUp() {
  const name = useInput('');
  const email = useInput('');
  const password = useInput('');
  const confirmPassword = useInput('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Only once the field has something in it — telling someone their empty
  // confirmation does not match while they are still typing the first one is
  // noise, not help.
  const mismatch = !!confirmPassword.value && password.value !== confirmPassword.value;

  const signUpWithProvider = async (provider: AuthProvider) => {
    setError('');
    setBusy(true);
    try {
      await signInWithPopup(auth, provider);
      navigate('/');
    } catch (caught) {
      setError(authErrorMessage(caught));
      setBusy(false);
    }
  };

  const signUp = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (busy) return;

    if (!name.value || !email.value || !password.value || !confirmPassword.value) {
      setError('Fill in every field to create your account.');
      return;
    }
    if (mismatch) {
      setError('Those passwords do not match.');
      return;
    }

    setError('');
    setBusy(true);
    try {
      const { user } = await createUserWithEmailAndPassword(auth, email.value, password.value);
      await updateProfile(user, { displayName: name.value });
      navigate('/');
    } catch (caught) {
      setError(authErrorMessage(caught));
      setBusy(false);
    }
  };

  return (
    <AuthShell title="Create your account" subtitle="Start tracking what you watch.">
      <form className="auth__form" onSubmit={signUp} noValidate>
        {error && (
          <p className="auth__error" role="alert">
            {error}
          </p>
        )}

        <div className="auth__field">
          <label htmlFor="signup-name">Name</label>
          <input
            id="signup-name"
            type="text"
            autoComplete="name"
            value={name.value}
            onChange={name.onChange}
          />
        </div>

        <div className="auth__field">
          <label htmlFor="signup-email">Email</label>
          <input
            id="signup-email"
            type="email"
            autoComplete="email"
            value={email.value}
            onChange={email.onChange}
          />
        </div>

        <PasswordField
          id="signup-password"
          label="Password"
          autoComplete="new-password"
          value={password.value}
          onChange={password.onChange}
        />

        <PasswordField
          id="signup-confirm"
          label="Confirm password"
          autoComplete="new-password"
          value={confirmPassword.value}
          onChange={confirmPassword.onChange}
          invalid={mismatch}
          hint={mismatch ? 'Those passwords do not match.' : undefined}
        />

        <button type="submit" className="auth__submit" disabled={busy}>
          {busy ? 'Creating account…' : 'Create account'}
        </button>

        <AuthProviders onChoose={signUpWithProvider} busy={busy} />

        <p className="auth__alt">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </form>
    </AuthShell>
  );
}

export default SignUp;
