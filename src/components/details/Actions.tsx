import { useState } from 'react';
import { Add, Check, Remove } from '@mui/icons-material';

import './Actions.css';

import SplitButton from 'components/SplitButton';

import { useStateValue } from 'context';
import { addItemToWatchlist, removeItemFromWatchlist } from 'api';
import { Media } from 'graphql/types';

function Actions({ media }: { media: Media }) {
  const [{ user, watchlist, anilist_user }, dispatch] = useStateValue();
  const [removeButtonText, updateRemoveButtonText] = useState('Added to Watchlist');

  return (
    user && (
      <div className="actions">
        {watchlist.filter(({ id }: Media) => id === media.id).length > 0 ? (
          <button
            onClick={() => removeItemFromWatchlist(media, user.uid, dispatch)}
            onMouseEnter={() => updateRemoveButtonText('Remove from Watchlist')}
            onMouseLeave={() => updateRemoveButtonText('Added to Watchlist')}
          >
            {removeButtonText === 'Added to Watchlist' ? <Check /> : <Remove />}
            <span>{removeButtonText}</span>
          </button>
        ) : (
          <button onClick={() => addItemToWatchlist(media, user.uid, dispatch)}>
            <Add />
            <span>Add to Watchlist</span>
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
