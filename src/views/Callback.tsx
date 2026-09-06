import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import { collection, setDoc, doc } from 'firebase/firestore';

import Loader from 'components/Loader';

import { useStateValue } from 'context';
import { ANILIST_VIEWER_QUERY } from 'graphql/queries';
import { authHeader } from 'helpers';
import { db } from 'config';
import { AccessToken, AnilistUser } from 'context/types';
import { saveAccessToken } from 'api';

function Callback() {
  const navigate = useNavigate();
  const location = useLocation();
  const [skipQuery, setSkipQuery] = useState(true);
  const [{ user }, dispatch] = useStateValue();
  const { data } = useQuery(ANILIST_VIEWER_QUERY, {
    skip: skipQuery,
    context: {
      headers: authHeader(),
    },
  });

  const handleAccessToken = async (code: string, userId: string) => {
    // Proxied by Vite's dev server to https://anilist.co/api/v2/oauth/token —
    // AniList's token endpoint sends no CORS headers. See server.proxy in
    // vite.config.mts.
    const request = await fetch('/anilist/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        grant_type: 'authorization_code',
        client_id: import.meta.env.VITE_ANILIST_CLIENT_ID,
        client_secret: import.meta.env.VITE_ANILIST_CLIENT_SECRET,
        redirect_uri: import.meta.env.VITE_ANILIST_CALLBACK_URI,
        code,
      }),
    });
    const token: AccessToken = await request.json();
    console.log(token);
    // Persist access token.
    localStorage.setItem('token', JSON.stringify(token));
    // Save access token to database.
    saveAccessToken(token, userId);
    // Update skipQuery.
    setSkipQuery(false);
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

  return <Loader />;
}

export default Callback;
