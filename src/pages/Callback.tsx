import { useEffect, useState } from 'react';
import { useLocation, useHistory } from 'react-router-dom';

import Loader from 'components/Loader';

import { authActions, anilistActions } from 'actions';
import { useStateValue } from 'context';

function Callback() {
  const history = useHistory();
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
      authActions.getAccessToken(code, dispatch).then(() => {
        anilistActions.fetchUser(user.uid, dispatch).then(() => {
          history.push('/settings');
        });
      });
    }
  }, [code, user]);

  return <Loader />;
}

export default Callback;
