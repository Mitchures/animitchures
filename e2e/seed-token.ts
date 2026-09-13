/**
 * Restores the fake AniList token document for the test account.
 *
 * Needed because the suite is destructive about this one document. The
 * token-expiry specs make the app believe AniList refused its credential, and
 * the app responds — correctly — by deleting `tokens/{uid}` from Firestore, so
 * that `hydrateSession` cannot read a dead token straight back on the next
 * sign-in. Against a real project that means every run leaves the account
 * looking permanently unlinked, and the next spec to care about a working token
 * sees a state no seed put there.
 *
 * That cost real debugging time: a sign-in test failed with "your AniList
 * session has expired", which looked like a bug in the app and was in fact the
 * suite reporting the truth about state it had itself destroyed.
 */
import { config as loadEnv } from 'dotenv';
import { initializeApp, getApps } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

// Loaded here rather than relied on from the caller. playwright.config.ts loads
// only `.env.test.local` (the test account's credentials); the Firebase project
// config lives in `.env.local`, so a spec calling this had no VITE_API_KEY.
loadEnv({ path: '.env.test.local' });
loadEnv({ path: '.env.local' });

const required = (name: string): string => {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is not set — check .env.test.local / .env.local`);
  return value;
};

/**
 * Fabricated on purpose. Every AniList request in the suite is intercepted, so
 * this token is never sent anywhere and cannot act on a real AniList account.
 */
export const FAKE_TOKEN = {
  token_type: 'Bearer',
  access_token: 'e2e-fake-token-never-sent-to-anilist',
  expires_in: 31536000,
  refresh_token: 'e2e-fake-refresh-token',
};

export async function seedAnilistToken(): Promise<void> {
  const app = getApps()[0] ?? initializeApp({
    apiKey: required('VITE_API_KEY'),
    authDomain: required('VITE_AUTH_DOMAIN'),
    projectId: required('VITE_PROJECT_ID'),
    storageBucket: required('VITE_STORAGE_BUCKET'),
    messagingSenderId: required('VITE_MESSAGING_SENDER_ID'),
    appId: required('VITE_APP_ID'),
  });

  const auth = getAuth(app);
  const db = getFirestore(app);
  const { user } = await signInWithEmailAndPassword(
    auth,
    required('E2E_EMAIL'),
    required('E2E_PASSWORD'),
  );

  await setDoc(doc(db, 'tokens', user.uid), FAKE_TOKEN);
}
