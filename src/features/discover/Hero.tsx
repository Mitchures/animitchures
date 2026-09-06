import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { AiFillHeart, AiOutlineHeart } from 'react-icons/ai';

import './Hero.css';

import Badge from 'components/Badge';

import { useStateValue } from 'context';
import { addItemToFavorites, removeItemFromFavorites } from 'api';
import { FeaturedBucket, FeaturedMedia } from 'graphql/featured';
import { mediaPath, scoreTier } from 'helpers';

const ROTATE_MS = 7000;
const FEATURE_COUNT = 5;

/** Rounds to the largest unit that still says something useful. */
const untilAiring = (seconds: number) => {
  if (seconds <= 0) return 'airing now';
  const days = Math.floor(seconds / 86400);
  if (days >= 1) return `in ${days}d`;
  const hours = Math.floor(seconds / 3600);
  if (hours >= 1) return `in ${hours}h`;
  return `in ${Math.max(1, Math.floor(seconds / 60))}m`;
};

function Hero({ trending }: { trending?: FeaturedBucket }) {
  const [{ user, favorites }, dispatch] = useStateValue();
  const [featured] = useState<FeaturedMedia[]>(() => trending?.media.slice(0, FEATURE_COUNT) ?? []);
  const [index, setIndex] = useState(0);
  const reduceMotion = useReducedMotion();

  const selected = featured[index];

  useEffect(() => {
    if (featured.length < 2) return;
    const timer = setInterval(() => setIndex((i) => (i + 1) % featured.length), ROTATE_MS);
    return () => clearInterval(timer);
  }, [featured.length]);

  if (!selected) return null;

  const title = selected.title.english ?? selected.title.userPreferred;
  const isFavorite = favorites?.some((id: number) => id === selected.id);

  return (
    <div className="hero">
      {/* The image is its own layer so it can drift without moving the scrim or
          the content sitting on it. */}
      <AnimatePresence initial={false}>
        <motion.div
          key={selected.id}
          className="hero__image"
          style={{
            backgroundImage: `url(${selected.bannerImage ?? selected.coverImage.extraLarge})`,
          }}
          initial={{ opacity: 0, scale: reduceMotion ? 1 : 1.02 }}
          animate={{ opacity: 1, scale: reduceMotion ? 1 : 1.09 }}
          exit={{ opacity: 0 }}
          transition={{
            opacity: { duration: 0.9 },
            // Slow drift across the whole slide, so the still image never sits
            // completely dead.
            scale: { duration: ROTATE_MS / 1000 + 1, ease: 'linear' },
          }}
        />
      </AnimatePresence>

      <div className="hero__scrim" />

      <div className="hero__content">
        <AnimatePresence mode="wait">
          <motion.img
            key={selected.id}
            className="hero__poster"
            src={selected.coverImage.extraLarge ?? selected.coverImage.large ?? undefined}
            alt={title}
            initial={reduceMotion ? undefined : { opacity: 0, y: 14 }}
            animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: -14 }}
            transition={{ duration: 0.35, ease: [0.2, 0.7, 0.3, 1] }}
          />
        </AnimatePresence>

        <AnimatePresence mode="wait">
          <motion.div
            key={selected.id}
            className="hero__body"
            initial={reduceMotion ? undefined : { opacity: 0, y: 12 }}
            animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: -12 }}
            transition={{ duration: 0.35, ease: [0.2, 0.7, 0.3, 1] }}
          >
            <div className="hero__badges">
              {selected.averageScore && (
                <Badge
                  tone={scoreTier(selected.averageScore)}
                  value={`★ ${selected.averageScore}`}
                />
              )}
              {/* Trending position is an accolade, like the ranking badges on
                  Details — so it takes the same gold treatment. */}
              <Badge tone="gold" value={`#${index + 1}`}>
                Trending
              </Badge>
              {selected.nextAiringEpisode && (
                <Badge value={`Ep ${selected.nextAiringEpisode.episode}`}>
                  {untilAiring(selected.nextAiringEpisode.timeUntilAiring)}
                </Badge>
              )}
            </div>

            <h1 className="hero__title">{title}</h1>

            <div className="hero__tags">
              {(selected.genres ?? []).slice(0, 4).map((genre) => (
                <span key={genre} className="hero__tag">
                  {genre}
                </span>
              ))}
            </div>

            <div className="hero__actions">
              <Link className="hero__cta" to={mediaPath(selected.id, selected.title.userPreferred)}>
                View details
              </Link>
              {user && (
                <button
                  type="button"
                  className="hero__cta hero__cta--favorite"
                  aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                  onClick={() =>
                    isFavorite
                      ? removeItemFromFavorites(selected.id, user.uid, dispatch)
                      : addItemToFavorites(selected.id, user.uid, dispatch)
                  }
                >
                  {isFavorite ? <AiFillHeart /> : <AiOutlineHeart />}
                  {isFavorite ? 'Favorited' : 'Favorite'}
                </button>
              )}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Indicators rather than the old banner thumbnails: the poster now
            carries the artwork, and five thumbnails competed with it. */}
        <div className="hero__dots" role="tablist" aria-label="Featured anime">
          {featured.map((item: FeaturedMedia, itemIndex: number) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={itemIndex === index}
              aria-label={item.title.english ?? item.title.userPreferred}
              className={`hero__dot${itemIndex === index ? ' hero__dot--active' : ''}`}
              onClick={() => setIndex(itemIndex)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default Hero;
