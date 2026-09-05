/**
 * Seeds deterministic Firestore state for the signed-in e2e suite.
 * Run with: yarn e2e:seed
 *
 * Uses the Firebase *client* SDK, which runs fine outside a browser, and signs
 * in as the test account. firestore.rules currently lets any signed-in user
 * write any document, which is what makes this possible without admin
 * credentials.
 */
import { config as loadEnv } from 'dotenv';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';

loadEnv({ path: '.env.test.local' });
loadEnv({ path: '.env.local' });

const required = (name: string): string => {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is not set — check .env.test.local / .env.local`);
  return value;
};

// A small, stable set so Favorites has deterministic content to assert against.
// Cowboy Bebop, Fullmetal Alchemist: Brotherhood, Steins;Gate.
const FAVORITE_IDS = [1, 5114, 9253];

async function main(): Promise<void> {
  const app = initializeApp({
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
  const uid = user.uid;
  console.log('signed in as', uid);

  // The createProfile / createFavorites Cloud Functions should have made these
  // on signup. Report rather than silently paper over it: a half-seeded account
  // produces confusing failures later.
  for (const collection of ['users', 'favorites']) {
    const snap = await getDoc(doc(db, collection, uid));
    console.log(`  ${collection}/${uid}: ${snap.exists() ? 'exists' : 'MISSING (creating)'}`);
  }

  await setDoc(doc(db, 'users', uid), {
    uid,
    displayName: required('E2E_DISPLAY_NAME'),
    email: required('E2E_EMAIL'),
    photoURL: null,
    anilistLinked: true,
  });

  await setDoc(doc(db, 'favorites', uid), { favorites: FAVORITE_IDS });

  // Fabricated on purpose. Every AniList request is intercepted in tests, so this
  // token is never sent anywhere and cannot act on any real AniList account.
  await setDoc(doc(db, 'tokens', uid), {
    token_type: 'Bearer',
    access_token: 'e2e-fake-token-never-sent-to-anilist',
    expires_in: 31536000,
    refresh_token: 'e2e-fake-refresh-token',
  });

  await setDoc(doc(db, 'anilist', uid), {
    id: 999999,
    name: 'E2E Test Viewer',
    avatar: { large: null, medium: null },
    bannerImage: null,
  });

  console.log('seed complete — uid', uid);
  process.exit(0);
}

main().catch((error) => {
  console.error('seed failed:', error);
  process.exit(1);
});
