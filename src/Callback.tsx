import { api } from 'api';
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { ANILIST_VIEWER_QUERY, ANILIST_USER_MEDIA_LIST_COLLECTION_QUERY } from 'utils';

function Callback() {
  const location = useLocation();
  const [code, setCode] = useState('');

  const getAnlistUserMediaListCollection = async (userId: number, userName: string) => {
    const { data } = await api.fetch({
      query: ANILIST_USER_MEDIA_LIST_COLLECTION_QUERY,
      variables: {
        userId,
        userName,
        type: 'ANIME',
      },
    });
    console.log(data);
  };

  const getAnilistViewer = async (authToken: string) => {
    const { data } = await api.fetch({
      headers: {
        Authorization: authToken,
      },
      query: ANILIST_VIEWER_QUERY,
      variables: {},
    });
    console.log(data);
    const { id, name } = data.Viewer;
    getAnlistUserMediaListCollection(id, name);
  };

  const getAccessToken = (code: string) => {
    // proxy stuff: https://stackoverflow.com/questions/36878255/allow-access-control-allow-origin-header-using-html5-fetch-api
    fetch('http://localhost:8010/proxy', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        grant_type: 'authorization_code',
        client_id: process.env.REACT_APP_ANILIST_CLIENT_ID,
        client_secret: process.env.REACT_APP_ANILIST_CLIENT_SECRET,
        redirect_uri: 'http://localhost:3000/callback',
        code,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        const { token_type, access_token } = data;
        getAnilistViewer(`${token_type} ${access_token}`);
      })
      .catch((error) => alert(error.message));
  };

  useEffect(() => {
    if (location.pathname === '/callback') {
      const search = location.search;
      const params = new URLSearchParams(search);
      const query = params.get('code');
      setCode(`${query}`);
      console.log(location, query);
    }
  }, [location]);

  useEffect(() => {
    if (code) {
      getAccessToken(code);
    }
  }, [code]);

  return <div className="callback">code: {code}</div>;
}

export default Callback;
