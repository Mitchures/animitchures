import { useState } from 'react';
import { AiFillHeart, AiOutlineHeart } from 'react-icons/ai';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';

import './Actions.css';

import SplitButton from 'components/SplitButton';

import { useStateValue } from 'context';
import { addItemToFavorites, removeItemFromFavorites } from 'api';
import { Media } from 'graphql/types';

function Actions({ media }: { media: Media }) {
  const [{ user, favorites, anilist_user }, dispatch] = useStateValue();
  const reduceMotion = useReducedMotion();
  const [burst, setBurst] = useState(0);
  const isFavorite = favorites.filter((id: number) => id === media.id).length > 0;

  return (
    user && (
      <div className="actions">
        <div className="actions__favoriteWrap">
          <AnimatePresence>
            {burst > 0 && !reduceMotion && (
              // key={burst} is what re-fires the ring on every click: a new key
              // remounts the element and restarts the animation. Without it only
              // the first click bursts.
              <motion.span
                key={burst}
                className="actions__burst"
                initial={{ scale: 1, opacity: 0.85 }}
                animate={{ scale: 2.3, opacity: 0 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              />
            )}
          </AnimatePresence>
          {/* One button rather than the add/remove pair this used to render,
              which differed only by icon and handler — the burst would have had
              to be maintained twice. aria-label is new; it was an icon with no
              accessible name at all. */}
          <motion.button
            className="actions__favoriteButton"
            aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            whileTap={reduceMotion ? undefined : { scale: 0.82 }}
            animate={burst > 0 && !reduceMotion ? { scale: [1, 1.22, 1] } : {}}
            transition={{ duration: 0.32 }}
            onClick={() => {
              setBurst((count) => count + 1);
              if (isFavorite) removeItemFromFavorites(media.id, user.uid, dispatch);
              else addItemToFavorites(media.id, user.uid, dispatch);
            }}
          >
            {isFavorite ? <AiFillHeart /> : <AiOutlineHeart />}
          </motion.button>
        </div>
        {/* TODO: implement anilist save entry feature */}
        {anilist_user && (
          <SplitButton value={media.mediaListEntry?.status as string} mediaId={media.id} />
        )}
      </div>
    )
  );
}

export default Actions;
