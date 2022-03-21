import { useEffect } from 'react';
import Avatar from '@material-ui/core/Avatar';
import { useQuery } from '@apollo/client';

import './Profile.css';

import { useStateValue } from 'context';
import { ANILIST_USER_AND_ACTIVITY_QUERY } from 'utils';

function Profile() {
  const [{ user, anilist_user }] = useStateValue();
  const { loading, error, data } = useQuery(ANILIST_USER_AND_ACTIVITY_QUERY, {
    variables: {
      id: anilist_user?.id,
      name: anilist_user?.name,
    },
    skip: !user?.anilistLinked,
  });

  useEffect(() => {
    if (data) {
      console.log(data);
    }
  }, [data]);

  return (
    <div className="profile">
      {user && (
        <div className="profile__container">
          <div className="profile__card">
            <Avatar
              className="profile__avatar"
              alt={`${user.displayName || user.email}`}
              src={`${user.photoURL}`}
            />
            <h1>{user.displayName}</h1>
          </div>
        </div>
      )}
    </div>
  );
}

export default Profile;
