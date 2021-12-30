import Avatar from '@material-ui/core/Avatar';

import './Profile.css';

import { useStateValue } from 'context';

function Profile() {
  const [{ user }] = useStateValue();

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
        </div>
      )}
    </div>
  );
}

export default Profile;
