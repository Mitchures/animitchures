import { useEffect, useState } from 'react';
import Avatar from '@material-ui/core/Avatar';

import './Profile.css';

import { useStateValue } from 'context';
import { getAnilistUserDetails, getAnilistUserActivity } from 'actions';

function Profile() {
  const [{ user, anilist_user }, dispatch] = useStateValue();
  const [activity, setActivity] = useState(null);
  const [details, setDetails] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const { id, name } = anilist_user;
      const detailsData = await getAnilistUserDetails(name, dispatch);
      const activityData = await getAnilistUserActivity(id, dispatch);
      setDetails(detailsData);
      setActivity(activityData);
    };
    if (anilist_user) fetchData();
  }, [anilist_user]);

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
