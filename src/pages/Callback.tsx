import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useQuery } from '@apollo/client';

import Loader from 'components/Loader';

import { useStateValue } from 'context';
import { ANILIST_VIEWER_QUERY } from 'graphql/queries';
import { authHeader } from 'helpers';
import { db } from 'config';
import { AccessToken } from 'context/types';
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
    // lcp --proxyUrl https://anilist.co/api/v2/oauth/token
    // proxy stuff: https://stackoverflow.com/questions/36878255/allow-access-control-allow-origin-header-using-html5-fetch-api
    // https://anilist.co/api/v2/oauth/token
    const request = await fetch('http://localhost:8010/proxy', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        grant_type: 'authorization_code',
        client_id: process.env.REACT_APP_ANILIST_CLIENT_ID,
        client_secret: process.env.REACT_APP_ANILIST_CLIENT_SECRET,
        redirect_uri: process.env.REACT_APP_ANILIST_CALLBACK_URI,
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

  const handleAnilistUser = async (anilist_user: any, userId: string) => {
    const collectionRef = db.collection('anilist');
    const docRef = collectionRef.doc(`${userId}`);
    docRef
      .set(anilist_user)
      .then(() => {
        dispatch({
          type: 'set_anilist_user',
          anilist_user,
        });
      })
      .then(() => navigate('/settings'))
      .catch((error) => alert(error.message));
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
