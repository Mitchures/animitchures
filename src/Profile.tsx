import './Profile.css';
import { useStateValue } from 'context';
import { auth } from 'utils';
import { useHistory } from 'react-router-dom';

import Avatar from '@material-ui/core/Avatar';

function Profile() {
  const [{ user }] = useStateValue();
  const history = useHistory();

  const logout = () => {
    auth.signOut().then(() => {
      history.push('/');
    });
  };

  return (
    <div className="profile">
      {user && (
        <div className="profile__container">
          <Avatar
            className="profile__avatar"
            alt={`${user.displayName || user.email}`}
            src={`${user.photoURL}`}
          />
          <h1>{user.displayName}</h1>
          <button type="button" onClick={logout}>
            Logout
          </button>
        </div>
      )}
    </div>
  );
}

export default Profile;
