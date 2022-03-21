import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@apollo/client';

import Loader from 'components/Loader';

import { useStateValue } from 'context';
import { ANILIST_VIEWER_QUERY } from 'utils';
import { authHeader } from 'helpers';
import { db } from 'config';

function Callback() {
  const navigate = useNavigate();
  const { code } = useParams();
  const [{ user }, dispatch] = useStateValue();
  const { loading, error, data } = useQuery(ANILIST_VIEWER_QUERY, {
    context: {
      headers: authHeader(),
    },
    skip: !authHeader(),
  });

  const handleAccessToken = async () => {
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
    const { access_token } = await request.json();
    // Persist access token.
    localStorage.setItem('token', JSON.stringify(access_token));
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
    if (code) handleAccessToken();
  }, [code]);

  useEffect(() => {
    if (data && user) {
      const { Viewer } = data;
      handleAnilistUser(Viewer, user.uid);
    }
  }, [data, user]);

  return <Loader />;
}

export default Callback;
