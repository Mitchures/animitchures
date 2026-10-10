import { useState } from 'react';
import { ArrowBack, Favorite, FavoriteBorder, IosShare, PlayArrow } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

import './HeroActions.css';

import IconButton from 'components/IconButton';
import ListStatusAction from 'features/details/ListStatusAction';

import { addItemToFavorites, removeItemFromFavorites } from 'api';
import { useStateValue } from 'context';
import { Media } from 'graphql/types';

/**
 * The details hero's actions, as glass squircles floating on the banner.
 *
 * They were a row of pills below the hero; on the art they read as controls
 * belonging to the image rather than to the page, which is what the reference
 * does. Back sits alone on the left so it is where a back button always is.
 *
 * The favourite button is the only lime on the hero, and only when it is on.
 * List status lives here too, as a squircle that grows into a pill: it is the
 * one action that holds a value rather than performing a verb, so it names
 * itself on approach. See `ListStatusAction`.
 */
function HeroActions({ media }: { media: Media }) {
  const [{ user, favorites, anilist_user: anilistUser }, dispatch] = useStateValue();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const isFavorite = favorites.some((id: number) => id === media.id);
  const trailer =
    media.trailer?.site === 'youtube' && media.trailer.id
      ? `https://www.youtube.com/watch?v=${media.trailer.id}`
      : null;

  return (
    <>
      <div className="heroActions heroActions--back">
        <IconButton variant="glass" label="Back" onClick={() => navigate(-1)}>
          <ArrowBack />
        </IconButton>
      </div>
      <div className="heroActions heroActions--main">
        {/* Signed out there is nothing to favourite and nothing to add, so the
            cluster is just the trailer and the link. */}
        {user && (
          <IconButton
            variant="glass"
            active={isFavorite}
            label={isFavorite ? 'Remove from favourites' : 'Add to favourites'}
            onClick={() => {
              if (isFavorite) removeItemFromFavorites(media.id, user.uid, dispatch);
              else addItemToFavorites(media.id, user.uid, dispatch);
            }}
          >
            {isFavorite ? <Favorite /> : <FavoriteBorder />}
          </IconButton>
        )}
        {/* Only with a linked account: without one there is no list to add to. */}
        {user && anilistUser && (
          <ListStatusAction value={media.mediaListEntry?.status} mediaId={media.id} />
        )}
        {trailer && (
          <a
            className="heroActions__link"
            href={trailer}
            target="_blank"
            rel="noreferrer"
            aria-label="Watch the trailer"
            title="Watch the trailer"
          >
            <span className="iconButton iconButton--glass">
              <PlayArrow />
            </span>
          </a>
        )}
        <IconButton
          variant="glass"
          label={copied ? 'Link copied' : 'Copy a link to this page'}
          onClick={() => {
            navigator.clipboard?.writeText(window.location.href).then(
              () => {
                setCopied(true);
                window.setTimeout(() => setCopied(false), 1600);
              },
              // A clipboard write can be refused outright, and a share button
              // that silently does nothing is worse than one that says so.
              () => setCopied(false),
            );
          }}
        >
          <IosShare />
        </IconButton>
        {copied && (
          <span className="heroActions__toast" role="status">
            Link copied
          </span>
        )}
      </div>
    </>
  );
}

export default HeroActions;
