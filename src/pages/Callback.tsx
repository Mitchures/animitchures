import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import Loader from 'components/Loader';

import { getAccessToken, fetchAnilistUser } from 'actions';
import { useStateValue } from 'context';

// TODO: Clean this up.
function Callback() {
  const navigate = useNavigate();
  const location = useLocation();
  const [code, setCode] = useState('');
  const [{ user }, dispatch] = useStateValue();

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
    if (code && user) {
      getAccessToken(code, dispatch).then(() => {
        fetchAnilistUser(user.uid, dispatch).then(() => {
          navigate('/settings');
        });
      });
    }
  }, [code, user]);

  return <Loader />;
}

export default Callback;
