import { useEffect } from 'react';
import Avatar from '@material-ui/core/Avatar';
import { useQuery } from '@apollo/client';
import { motion } from 'framer-motion';

import './Profile.css';

import { useStateValue } from 'context';
import { ANILIST_USER_AND_ACTIVITY_QUERY } from 'graphql/queries';

function Profile() {
  const [{ user, anilist_user }] = useStateValue();
  const { data } = useQuery(ANILIST_USER_AND_ACTIVITY_QUERY, {
    variables: {
      id: anilist_user?.id,
      name: anilist_user?.name,
    },
    skip: !user?.anilistLinked,
  });

  useEffect(() => {
    if (data) {
      console.log(data);
      console.log(data.User.stats.activityHistory);
    }
  }, [data]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="profile"
    >
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
    </motion.div>
  );
}

export default Profile;
