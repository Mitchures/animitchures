import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation } from '@apollo/client';

import './UpNextCard.css';

import EpisodeStrip from './EpisodeStrip';

import { SAVE_MEDIA_LIST_ENTRY_MUTATION } from 'graphql/mutations';
import { authHeader, mediaPath } from 'helpers';
import { WatchlistEntry } from './types';

const DAY = 86_400;

/** "airs Thursday", "airs tomorrow" — whichever a person would actually say. */
const airingLabel = (airingAt: number) => {
  const seconds = airingAt - Math.floor(Date.now() / 1000);
  if (seconds <= 0) return 'out now';
  if (seconds < DAY) return 'airs today';
  if (seconds < DAY * 2) return 'airs tomorrow';
  if (seconds < DAY * 7) {
    return `airs ${new Date(airingAt * 1000).toLocaleDateString(undefined, { weekday: 'long' })}`;
  }
  return `airs in ${Math.round(seconds / DAY)} days`;
};

/**
 * One title you are part-way through.
 *
 * The button names the episode it will mark, and marking it is a real write —
 * `SaveMediaListEntry` already accepts progress. A button labelled with an
 * episode number that only navigated somewhere would be lying about what it
 * does.
 */
function UpNextCard({ entry }: { entry: WatchlistEntry }) {
  const { media } = entry;
  const [progress, setProgress] = useState(entry.progress);
  const [saveEntry, { loading }] = useMutation(SAVE_MEDIA_LIST_ENTRY_MUTATION);

  const total = media.episodes;
  const next = progress + 1;
  const finale = !!total && next >= total;
  const remaining = total ? total - progress : null;

  const markWatched = () => {
    const optimistic = progress;
    setProgress(next);
    saveEntry({
      variables: {
        id: entry.id,
        mediaId: media.id,
        progress: next,
        // AniList does not close a series out on its own. Reaching the last
        // episode is what "finished" means, so say so in the same write.
        ...(finale ? { status: 'COMPLETED' } : {}),
      },
      context: { headers: authHeader() },
    }).catch(() => setProgress(optimistic));
  };

  const airing = media.nextAiringEpisode;
  const caughtUp = !!airing && next >= airing.episode;

  return (
    <article className="upNext">
      <Link className="upNext__art" to={mediaPath(media.id, media.title.userPreferred)}>
        <img src={media.coverImage.large} alt="" loading="lazy" />
      </Link>

      <div className="upNext__body">
        <Link className="upNext__title" to={mediaPath(media.id, media.title.userPreferred)}>
          {media.title.userPreferred}
        </Link>

        <EpisodeStrip progress={progress} episodes={total} />

        <div className="upNext__meta">
          <b className="upNext__count">
            {progress}
            <span>/{total ?? '?'}</span>
          </b>
          <span className="upNext__left">
            {remaining === null ? 'ongoing' : remaining > 0 ? `${remaining} left` : 'finished'}
          </span>
          {airing && (
            <em className="upNext__airing">
              Ep {airing.episode} {airingLabel(airing.airingAt)}
            </em>
          )}
        </div>
      </div>

      {/* Nothing to mark when the next episode has not aired yet. */}
      {!caughtUp && (!total || progress < total) && (
        <button
          type="button"
          className="upNext__mark"
          onClick={markWatched}
          disabled={loading}
          title={`Mark episode ${next} of ${media.title.userPreferred} watched`}
        >
          Watched {next}
        </button>
      )}
    </article>
  );
}

export default UpNextCard;
