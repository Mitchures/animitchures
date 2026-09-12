import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { defineSecret } from 'firebase-functions/params';
import * as functionsV1 from 'firebase-functions/v1';
import * as admin from 'firebase-admin';

admin.initializeApp();

const db = admin.firestore();

/**
 * The AniList client secret, held by Cloud Secret Manager.
 *
 * It used to be `VITE_ANILIST_CLIENT_SECRET`, which Vite inlines into the
 * bundle at build time — so it shipped to every browser that loaded the app.
 * It is declared here and bound to the one function that needs it; nothing
 * else in the project can read it.
 *
 * Set it once with: firebase functions:secrets:set ANILIST_CLIENT_SECRET
 */
const anilistClientSecret = defineSecret('ANILIST_CLIENT_SECRET');

type AnilistToken = {
  access_token: string;
  expires_in: number;
  refresh_token: string;
  token_type: string;
};

/**
 * Exchanges an AniList authorization code for an access token.
 *
 * This is the half of OAuth that must not happen in a browser. AniList's token
 * endpoint also sends no CORS headers, so the browser could never call it
 * directly anyway — the dev server used to proxy it, which is why account
 * linking worked locally and nowhere else. Running it here fixes both.
 *
 * The access token is returned to the caller rather than kept server-side:
 * `authHeader()` needs it to sign the app's AniList GraphQL queries. Only the
 * *secret* stops being public.
 */
export const exchangeAnilistCode = onCall(
  { secrets: [anilistClientSecret], cors: true },
  async (request): Promise<AnilistToken> => {
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'Sign in before linking an AniList account.');
    }

    const { code, clientId, redirectUri } = request.data ?? {};
    for (const [name, value] of Object.entries({ code, clientId, redirectUri })) {
      if (typeof value !== 'string' || !value) {
        throw new HttpsError('invalid-argument', `Missing ${name}.`);
      }
    }

    const response = await fetch('https://anilist.co/api/v2/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        grant_type: 'authorization_code',
        client_id: clientId,
        client_secret: anilistClientSecret.value(),
        redirect_uri: redirectUri,
        code,
      }),
    });

    // AniList answers a bad code with 400 and a JSON body. Surfacing its text
    // would leak the request echo, which includes the secret, so it is logged
    // server-side and the caller gets the status only.
    if (!response.ok) {
      const detail = await response.text();
      console.error('AniList token exchange failed', response.status, detail);
      throw new HttpsError('permission-denied', `AniList rejected the code (${response.status}).`);
    }

    const token = (await response.json()) as Partial<AnilistToken>;
    if (!token.access_token) {
      console.error('AniList returned no access_token', token);
      throw new HttpsError('internal', 'AniList returned no access token.');
    }

    return token as AnilistToken;
  },
);

/* The three triggers below predate the v2 API. They keep working through the
   v1 namespace, which firebase-functions 6 still ships — porting them to v2 is
   a rewrite of their signatures for no behavioural gain. */

export const createProfile = functionsV1.auth.user().onCreate(async (userRecord) => {
  const { uid, email, photoURL, displayName } = userRecord;
  const profile = {
    uid,
    email,
    photoURL,
    displayName,
    isAdult: false,
    anilistLinked: false,
  };
  return await db.collection('users').doc(uid).set(profile).catch(console.error);
});

export const createFavorites = functionsV1.auth.user().onCreate(async (userRecord) => {
  const { uid } = userRecord;
  return await db.collection('favorites').doc(uid).set({ favorites: [] }).catch(console.error);
});

export const linkedAnilistAccount = functionsV1.firestore
  .document('anilist/{docId}')
  .onCreate(async (_, context) => {
    const userId = context.params.docId;
    const userSnapshot = await db.collection('users').doc(userId).get();
    return await db
      .collection('users')
      .doc(userId)
      .set({ ...userSnapshot.data(), anilistLinked: true })
      .catch(console.error);
  });
