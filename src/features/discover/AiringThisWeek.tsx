import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';

import './AiringThisWeek.css';

import SectionHeading from 'components/SectionHeading';

import { Featured, FeaturedBucket, FeaturedMedia } from 'graphql/featured';
import { mediaPath } from 'helpers';

const WEEK_SECONDS = 7 * 24 * 60 * 60;
const CARD_COUNT = 4;
/**
 * How long a card keeps saying "Airing now" after its countdown reaches zero.
 *
 * The episode's own runtime rather than a fixed grace period: "Airing now" is
 * true for exactly as long as the episode is on, which is 12 minutes for a
 * short and ~24 for a normal TV episode. A card that vanished the instant it
 * hit zero would read as a glitch, and a flat five minutes would be wrong in
 * both directions.
 *
 * Capped so a feature-length special does not hold a slot all evening, and
 * defaulted for the handful of entries with no duration.
 */
const DEFAULT_RUNTIME_MINUTES = 24;
const MAX_ON_AIR_MINUTES = 90;

const onAirWindow = (media: FeaturedMedia) =>
  Math.min(media.duration ?? DEFAULT_RUNTIME_MINUTES, MAX_ON_AIR_MINUTES) * 60;

/**
 * Live countdown text. Rounds to the two largest units that still say something
 * useful — "2d 6h" a week out, "12m 30s" when it is nearly on.
 */
const formatCountdown = (secondsLeft: number) => {
  if (secondsLeft <= 0) return 'Airing now';

  const days = Math.floor(secondsLeft / 86400);
  const hours = Math.floor((secondsLeft % 86400) / 3600);
  const minutes = Math.floor((secondsLeft % 3600) / 60);
  const seconds = secondsLeft % 60;

  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m ${seconds}s`;
};

/** An entry the filter below has already proven has an airing date. */
type Airing = FeaturedMedia & {
  nextAiringEpisode: NonNullable<FeaturedMedia['nextAiringEpisode']>;
};

const MotionLink = motion.create(Link);

/**
 * What airs in the next seven days, drawn from the media already loaded for the
 * Discover rails — `nextAiringEpisode` comes back with every one of them, so
 * this section costs no extra request.
 *
 * The artwork is the card and the countdown is the headline; a small thumbnail
 * beside grey text did not read as urgent, which is the only thing this section
 * is for.
 */
function AiringThisWeek({ featured }: { featured: Featured }) {
  const [now, setNow] = useState(() => Math.floor(Date.now() / 1000));
  const reduceMotion = useReducedMotion();

  const upcoming = useMemo(() => {
    const seen = new Map<number, Airing>();
    // Buckets overlap heavily — the same show is often trending *and* popular
    // this season — so dedupe before sorting.
    Object.values(featured ?? {}).forEach((bucket: FeaturedBucket | undefined) => {
      (bucket?.media ?? []).forEach((media: FeaturedMedia) => {
        if (media?.nextAiringEpisode?.airingAt && !seen.has(media.id))
          seen.set(media.id, media as Airing);
      });
    });

    return [...seen.values()]
      .filter((media) => {
        const secondsLeft = media.nextAiringEpisode.airingAt - now;
        // Drops off once the episode has finished airing; the cards behind it
        // slide forward and the next one up takes the empty slot.
        return secondsLeft > -onAirWindow(media) && secondsLeft < WEEK_SECONDS;
      })
      .sort((a, b) => a.nextAiringEpisode.airingAt - b.nextAiringEpisode.airingAt)
      .slice(0, CARD_COUNT);
  }, [featured, now]);

  useEffect(() => {
    if (!upcoming.length) return;
    const timer = setInterval(() => setNow(Math.floor(Date.now() / 1000)), 1000);
    return () => clearInterval(timer);
  }, [upcoming.length]);

  if (!upcoming.length) return null;

  return (
    <section className="airing">
      <SectionHeading title="Airing this week" />
      <div className="airing__row">
        {/* layout + AnimatePresence: when one expires it fades out and the rest
            animate into the space rather than snapping across. */}
        <AnimatePresence initial={false} mode="popLayout">
          {upcoming.map((media, index) => {
            const secondsLeft = media.nextAiringEpisode.airingAt - now;
            return (
              <MotionLink
                key={media.id}
                layout={!reduceMotion}
                initial={reduceMotion ? undefined : { opacity: 0, scale: 0.94 }}
                animate={reduceMotion ? undefined : { opacity: 1, scale: 1 }}
                exit={reduceMotion ? undefined : { opacity: 0, scale: 0.94 }}
                transition={{ duration: 0.35, ease: [0.2, 0.7, 0.3, 1] }}
                className="airing__card"
                to={mediaPath(media.id, media.title.userPreferred)}
                style={{
                  // Falls back to the cover: plenty of titles have no banner art.
                  backgroundImage: `url(${media.bannerImage ?? media.coverImage.extraLarge ?? media.coverImage.large})`,
                }}
              >
                <span className="airing__scrim" />
                {/* "Next up" would be a lie once the clock has run out, so the
                  flag reports which of the two states this card is in. */}
                {index === 0 && (
                  <span className={`airing__flag${secondsLeft <= 0 ? ' airing__flag--live' : ''}`}>
                    {secondsLeft <= 0 ? 'On air' : 'Next up'}
                  </span>
                )}
                <span className="airing__body">
                  <span className="airing__title">
                    {media.title.english ?? media.title.userPreferred}
                  </span>
                  <span className="airing__clock">{formatCountdown(secondsLeft)}</span>
                  <span className="airing__episode">Episode {media.nextAiringEpisode.episode}</span>
                </span>
              </MotionLink>
            );
          })}
        </AnimatePresence>
      </div>
    </section>
  );
}

export default AiringThisWeek;
