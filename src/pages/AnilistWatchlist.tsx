import { useEffect, useState } from 'react';
import { useQuery } from '@apollo/client';
import { motion } from 'framer-motion';

import './AnilistWatchlist.css';

import Card from 'components/Card';
import Loader from 'components/Loader';

import { useStateValue } from 'context';
import { ANILIST_USER_MEDIA_LIST_COLLECTION_QUERY } from 'graphql/queries';

const motion_container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const motion_item = {
  hidden: { opacity: 0 },
  show: { opacity: 1 },
};

function Watchlist() {
  const [{ anilist_user }] = useStateValue();
  const [collection, setCollection] = useState([]);
  const { loading, data } = useQuery(ANILIST_USER_MEDIA_LIST_COLLECTION_QUERY, {
    variables: {
      userId: anilist_user?.id,
      userName: anilist_user?.name,
      type: 'ANIME',
    },
    skip: !anilist_user,
    pollInterval: 300000, // 5 minutes
  });

  useEffect(() => {
    if (data) {
      console.log(data);
      const { MediaListCollection } = data;
      setCollection(MediaListCollection.lists);
    }
  }, [data]);

  return (
    <div className="watchlist">
      {anilist_user && !loading ? (
        <>
          {collection &&
            collection.map((list: any, index: number) => (
              <div key={index}>
                <h3>{list.name}</h3>
                <motion.div
                  variants={motion_container}
                  initial="hidden"
                  animate="show"
                  className="watchlist__grid"
                >
                  {list.entries.map((entry: any) => (
                    <motion.div key={entry.media.id} variants={motion_item}>
                      <Card {...entry.media} />
                    </motion.div>
                  ))}
                </motion.div>
              </div>
            ))}
        </>
      ) : (
        <Loader />
      )}
    </div>
  );
}

export default Watchlist;
