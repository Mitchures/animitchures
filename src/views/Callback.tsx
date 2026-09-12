import { useEffect, useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import { httpsCallable, FunctionsError } from 'firebase/functions';
import { collection, setDoc, doc } from 'firebase/firestore';

import './Callback.css';

import { useStateValue } from 'context';
import { ANILIST_VIEWER_QUERY } from 'graphql/queries';
import { authHeader } from 'helpers';
import { db, functions } from 'config';
import { AccessToken, AnilistUser } from 'context/types';
import { saveAccessToken } from 'api';

function Callback() {
  const navigate = useNavigate();
  const location = useLocation();
  const [skipQuery, setSkipQuery] = useState(true);
  const [failure, setFailure] = useState<string | null>(null);
  const [{ user }, dispatch] = useStateValue();
  const { data } = useQuery(ANILIST_VIEWER_QUERY, {
    skip: skipQuery,
    context: {
      headers: authHeader(),
    },
  });

  // The exchange runs in a Cloud Function because it needs the client secret,
  // and anything the browser holds is public — Vite inlines every VITE_ var
  // into the bundle. It also sidesteps CORS: AniList's token endpoint sends no
  // CORS headers, which is why this used to work only behind the dev proxy.
  const exchangeCode = httpsCallable<
    { code: string; clientId: string; redirectUri: string },
    AccessToken
  >(functions, 'exchangeAnilistCode');

  const handleAccessToken = async (code: string, userId: string) => {
    try {
      const { data: token } = await exchangeCode({
        code,
        clientId: import.meta.env.VITE_ANILIST_CLIENT_ID,
        redirectUri: import.meta.env.VITE_ANILIST_CALLBACK_URI,
      });
      localStorage.setItem('token', JSON.stringify(token));
      await saveAccessToken(token, userId);
      setSkipQuery(false);
    } catch (error) {
      // An authorization code is single-use, so a refresh of this page fails
      // here rather than silently hanging on the spinner.
      setFailure((error as FunctionsError).message || 'Could not link your AniList account.');
    }
  };

  const handleAnilistUser = async (anilist_user: AnilistUser, userId: string) => {
    try {
      await setDoc(doc(collection(db, 'anilist'), `${userId}`), anilist_user);

      // Set the flag here rather than leaving it to the linkedAnilistAccount
      // Cloud Function. That trigger fires onCreate, so re-linking an account
      // overwrites the document without firing it — and it does nothing at all
      // unless functions are deployed. Linking should not depend on either.
      await setDoc(
        doc(collection(db, 'users'), `${userId}`),
        { anilistLinked: true },
        { merge: true },
      );

      dispatch({ type: 'set_anilist_user', anilist_user });
      if (user) dispatch({ type: 'update_user', user: { ...user, anilistLinked: true } });
      navigate('/settings');
    } catch (error) {
      alert((error as Error).message);
    }
  };

  useEffect(() => {
    if (location.pathname === '/callback' && user) {
      const search = location.search;
      const params = new URLSearchParams(search);
      const query = params.get('code');
      handleAccessToken(`${query}`, user.uid);
    }
  }, [location, user]);

  useEffect(() => {
    if (data && user) {
      const { Viewer } = data;
      handleAnilistUser(Viewer, user.uid);
    }
  }, [data, user]);

  // Not a skeleton: a skeleton promises "content of this shape is arriving
  // here", and nothing arrives here — the page exchanges the code and
  // redirects to settings. So it says what it is doing instead.
  if (failure) {
    return (
      <p className="callback">
        {failure} <Link to="/settings">Back to settings</Link>
      </p>
    );
  }
  return <p className="callback">Linking your AniList account\u2026</p>;
}

export default Callback;
