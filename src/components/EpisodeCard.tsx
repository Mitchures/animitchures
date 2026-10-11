import { Link } from 'react-router-dom';

import './EpisodeCard.css';

import DotNumber from 'components/DotNumber';
import { Airing, whenLabel } from 'features/discover/derive';
import { mediaPath } from 'helpers';

/**
 * How many ticks the footer draws at most.
 *
 * A run is a strip of episodes with the next one marked, but ONE PIECE is on
 * episode 1177 — so beyond this the strip stops being one tick per episode and
 * becomes a proportional gauge.
 */
const MAX_TICKS = 28;

const ticks = (episode: number, total?: number | null) => {
  if (total && total <= MAX_TICKS) {
    return Array.from({ length: total }, (_, i) => i === episode - 1);
  }
  // No total means an open-ended run: the marker sits at the end, because that
  // is where it is — there is no finish line to be part-way towards.
  const marked = total ? Math.round(((episode - 1) / total) * (MAX_TICKS - 1)) : MAX_TICKS - 1;
  return Array.from({ length: MAX_TICKS }, (_, i) => i === marked);
};

/** One airing episode as a card: which episode, when, and how far through the run. */
function EpisodeCard({ media, now = new Date() }: { media: Airing; now?: Date }) {
  const title = media.title.english ?? media.title.userPreferred;
  const { episode, airingAt } = media.nextAiringEpisode;

  return (
    <Link className="episodeCard" to={mediaPath(media.id, media.title.userPreferred)}>
      <div className="episodeCard__head">
        <img src={media.coverImage.large ?? undefined} alt="" />
        <span>{title}</span>
      </div>
      <div className="episodeCard__number">
        <DotNumber value={episode} size="lg" />
        {media.episodes && <small>of {media.episodes}</small>}
      </div>
      <div className="episodeCard__when">{whenLabel(airingAt, now)}</div>
      <div className="episodeCard__run" aria-hidden="true">
        {ticks(episode, media.episodes).map((isNext, i) => (
          <i key={i} className={isNext ? 'is-next' : undefined} />
        ))}
      </div>
    </Link>
  );
}

export default EpisodeCard;
