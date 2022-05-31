import { useEffect, useState } from 'react';
import { useLazyQuery } from '@apollo/client';
import { motion } from 'framer-motion';
import { cloneDeep } from 'lodash';

import './Favorites.css';

import Card from 'components/Card';
import Loader from 'components/Loader';

import { useStateValue } from 'context';
import { Media } from 'graphql/types';
import { DETAILS_LIST_QUERY } from 'graphql/queries';

const getSortedMedia = (list: Media[]) => {
  const media = cloneDeep(list);
  media.forEach((item: Media) => {
    if (item.title && !item.title.english) {
      item.title.english = item.title.userPreferred;
    }
  });
  media.sort((a: Media, b: Media) => {
    if (a.title?.english && b.title?.english) {
      return a.title.english.localeCompare(b.title.english);
    }
    return 0;
  });
  return media;
};

function Favorites() {
  const [{ favorites }] = useStateValue();
  const [favoritesList, setFavoritesList] = useState<Media[]>([]);
  const [isLoading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [perPage] = useState(15);
  const [fetchFavorites, { loading, data }] = useLazyQuery(DETAILS_LIST_QUERY, {
    variables: {
      id_in: favorites,
      type: 'ANIME',
      page,
      perPage,
    },
  });

  useEffect(() => {
    if (favorites.length > 0) fetchFavorites();
  }, [favorites]);

  useEffect(() => {
    if (!loading && data) {
      console.log(data);
      const { media, pageInfo } = data.Page;
      setFavoritesList((prev: Media[]) => [...prev, ...media]);
      if (pageInfo.hasNextPage) {
        setPage(page + 1);
        fetchFavorites();
      } else {
        setLoading(false);
      }
    }
  }, [data]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="favorites"
    >
      {favoritesList.length > 0 ? (
        <>
          {!isLoading ? (
            <div className="favorites__grid">
              {getSortedMedia(favoritesList).map((mediaItem: Media) => (
                <Card key={mediaItem.id} {...mediaItem} />
              ))}
            </div>
          ) : (
            <Loader />
          )}
        </>
      ) : (
        <Loader placeholderText="You have no favorites..." />
      )}
    </motion.div>
  );
}

export default Favorites;
