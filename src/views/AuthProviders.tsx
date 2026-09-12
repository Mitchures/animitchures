import { AuthProvider } from 'firebase/auth';

import { appleProvider, googleProvider } from 'config';

const AppleMark = () => (
  <svg viewBox="0 0 512 512" aria-hidden="true">
    <path d="M349.13 136.86c-40.32 0-57.36 19.24-85.44 19.24c-28.79 0-50.75-19.1-85.69-19.1c-34.2 0-70.67 20.88-93.83 56.45c-32.52 50.16-27 144.63 25.67 225.11c18.84 28.81 44 61.12 77 61.47h.6c28.68 0 37.2-18.78 76.67-19h.6c38.88 0 46.68 18.89 75.24 18.89h.6c33-.35 59.51-36.15 78.35-64.85c13.56-20.64 18.6-31 29-54.35c-76.19-28.92-88.43-136.93-13.08-178.34c-23-28.8-55.32-45.48-85.79-45.48z" />
    <path d="M340.25 32c-24 1.63-52 16.91-68.4 36.86c-14.88 18.08-27.12 44.9-22.32 70.91h1.92c25.56 0 51.72-15.39 67-35.11c14.72-18.77 25.88-45.37 21.8-72.66z" />
  </svg>
);

const GoogleMark = () => (
  <svg viewBox="0 0 48 48" aria-hidden="true">
    <path
      fill="#FFC107"
      d="M43.6 20.1H42V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.05 6.05 29.3 4 24 4 13 4 4 13 4 24s9 20 20 20 20-9 20-20c0-1.3-.1-2.6-.4-3.9z"
    />
    <path
      fill="#FF3D00"
      d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.05 6.05 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"
    />
    <path
      fill="#4CAF50"
      d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.3 0-9.7-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"
    />
    <path
      fill="#1976D2"
      d="M43.6 20.1H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.6-.4-3.9z"
    />
  </svg>
);

interface Props {
  onChoose: (provider: AuthProvider) => void;
  busy: boolean;
}

/**
 * Apple and Google, on both pages.
 *
 * Login offered these and Sign up did not, so the two pages disagreed about
 * how an account could be made — and a provider sign-in creates the account
 * anyway, which made the omission misleading rather than merely inconsistent.
 */
function AuthProviders({ onChoose, busy }: Props) {
  return (
    <>
      <div className="auth__rule">or</div>
      <div className="auth__providers">
        <button
          type="button"
          className="auth__provider auth__provider--apple"
          onClick={() => onChoose(appleProvider)}
          disabled={busy}
        >
          <AppleMark />
          <span>Apple</span>
        </button>
        <button
          type="button"
          className="auth__provider"
          onClick={() => onChoose(googleProvider)}
          disabled={busy}
        >
          <GoogleMark />
          <span>Google</span>
        </button>
      </div>
    </>
  );
}

export default AuthProviders;
