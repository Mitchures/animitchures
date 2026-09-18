import { useEffect, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { AiFillHeart, AiOutlineHeart } from 'react-icons/ai';

import './SlideHero.css';

import Chip from 'components/Chip';
import Button from 'components/Button';
import ScoreChip from 'components/ScoreChip';

import { useStateValue } from 'context';
import { addItemToFavorites, removeItemFromFavorites } from 'api';
import { FeaturedMedia } from 'graphql/featured';
import { mediaPath } from 'helpers';
import { whenLabel } from 'features/discover/derive';

const ROTATE_MS = 7000;

/** The main studio's name, or nothing — plenty of entries have no studio edge. */
const mainStudio = (media: FeaturedMedia): string =>
  media.studios?.edges?.find((edge) => edge?.isMain)?.node?.name ?? '';

/**
 * What is worth saying about this title in one line: where it is up to if it is
 * airing, how long it ran if it is not, and who made it.
 */
const metaLine = (media: FeaturedMedia, now: Date): string => {
  const next = media.nextAiringEpisode;
  const progress = next
    ? `Episode ${next.episode}${media.episodes ? ` of ${media.episodes}` : ''} · ${whenLabel(next.airingAt, now)}`
    : media.episodes
      ? `${media.episodes} episodes`
      : '';
  return [progress, mainStudio(media)].filter(Boolean).join(' · ');
};

/**
 * The cinematic trending slider.
 *
 * Kept from the old Hero because this is an anime app and the art is the
 * product — the dashboard around it carries the numbers. Crossfades through the
 * top five trending titles while the incoming image drifts, so the still never
 * sits completely dead, and the active page bar fills as a timer rather than
 * leaving the rotation unexplained.
 */
function SlideHero({ media }: { media: FeaturedMedia[] }) {
  const [{ user, favorites }, dispatch] = useStateValue();
  const [index, setIndex] = useState(0);
  const reduceMotion = useReducedMotion();
  const now = new Date();

  useEffect(() => {
    if (media.length < 2) return;
    const timer = setInterval(() => setIndex((current) => (current + 1) % media.length), ROTATE_MS);
    return () => clearInterval(timer);
  }, [media.length]);

  const selected = media[index];
  if (!selected) return null;

  const title = selected.title.english ?? selected.title.userPreferred;
  const isFavorite = favorites?.some((id: number) => id === selected.id);

  return (
    <section className="slideHero">
      {/* The image is its own layer so it can drift without moving the scrim or
          the copy sitting on it. */}
      <AnimatePresence initial={false}>
        <motion.div
          key={selected.id}
          className="slideHero__image"
          style={{
            backgroundImage: `url(${selected.bannerImage ?? selected.coverImage.extraLarge})`,
          }}
          initial={{ opacity: 0, scale: reduceMotion ? 1 : 1.02 }}
          animate={{ opacity: 1, scale: reduceMotion ? 1 : 1.09 }}
          exit={{ opacity: 0 }}
          transition={{
            opacity: { duration: 0.64 },
            scale: { duration: ROTATE_MS / 1000 + 1, ease: 'linear' },
          }}
        />
      </AnimatePresence>

      <div className="slideHero__scrim" />

      {selected.averageScore != null && (
        <div className="slideHero__score">
          <ScoreChip score={selected.averageScore} rank={`Trending #${index + 1}`} />
        </div>
      )}

      <AnimatePresence mode="wait">
        <motion.div
          key={selected.id}
          className="slideHero__in"
          initial={reduceMotion ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduceMotion ? undefined : { opacity: 0, y: -12 }}
          transition={{ duration: 0.32, ease: [0.2, 0.7, 0.3, 1] }}
        >
          <img
            className="slideHero__poster"
            src={selected.coverImage.extraLarge ?? selected.coverImage.large ?? undefined}
            alt=""
          />
          <div className="slideHero__body">
            <div className="slideHero__meta">{metaLine(selected, now)}</div>
            <h2 className="slideHero__title">{title}</h2>
            <div className="slideHero__tags">
              {(selected.genres ?? []).slice(0, 4).map((genre) => (
                <Chip key={genre} tone="glass">
                  {genre}
                </Chip>
              ))}
            </div>
            <div className="slideHero__actions">
              <Button to={mediaPath(selected.id, selected.title.userPreferred)}>View details</Button>
              {user && (
                <button
                  type="button"
                  className="slideHero__favorite"
                  aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                  onClick={() =>
                    isFavorite
                      ? removeItemFromFavorites(selected.id, user.uid, dispatch)
                      : addItemToFavorites(selected.id, user.uid, dispatch)
                  }
                >
                  {isFavorite ? <AiFillHeart /> : <AiOutlineHeart />}
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="slideHero__pages" role="tablist" aria-label="Featured anime">
        {media.map((item, itemIndex) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={itemIndex === index}
            aria-label={item.title.english ?? item.title.userPreferred}
            className={`slideHero__page${itemIndex === index ? ' is-on' : ''}`}
            onClick={() => setIndex(itemIndex)}
          />
        ))}
      </div>
    </section>
  );
}

export default SlideHero;
