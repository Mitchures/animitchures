import { AiFillHeart, AiOutlineHeart } from 'react-icons/ai';

import './Actions.css';

import SplitButton from 'components/SplitButton';

import { useStateValue } from 'context';
import { addItemToFavorites, removeItemFromFavorites } from 'api';
import { Media } from 'graphql/types';

function Actions({ media }: { media: Media }) {
  const [{ user, favorites, anilist_user }, dispatch] = useStateValue();

  return (
    user && (
      <div className="actions">
        {favorites.filter((id: number) => id === media.id).length > 0 ? (
          <button
            className="actions__favoriteButton"
            onClick={() => removeItemFromFavorites(media.id, user.uid, dispatch)}
          >
            <AiFillHeart />
          </button>
        ) : (
          <button
            className="actions__favoriteButton"
            onClick={() => addItemToFavorites(media.id, user.uid, dispatch)}
          >
            <AiOutlineHeart />
          </button>
        )}
        {/* TODO: implement anilist save entry feature */}
        {anilist_user && (
          <SplitButton value={media.mediaListEntry?.status as string} mediaId={media.id} />
        )}
      </div>
    )
  );
}

export default Actions;
