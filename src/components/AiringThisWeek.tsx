import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';

import './AiringThisWeek.css';

import { mediaPath } from 'helpers';

const WEEK_SECONDS = 7 * 24 * 60 * 60;
const CARD_COUNT = 4;

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

/**
 * What airs in the next seven days, drawn from the media already loaded for the
 * Discover rails — `nextAiringEpisode` comes back with every one of them, so
 * this section costs no extra request.
 *
 * The artwork is the card and the countdown is the headline; a small thumbnail
 * beside grey text did not read as urgent, which is the only thing this section
 * is for.
 */
function AiringThisWeek({ featured }: { featured: Record<string, any> }) {
  const [now, setNow] = useState(() => Math.floor(Date.now() / 1000));

  const upcoming = useMemo(() => {
    const seen = new Map<number, any>();
    // Buckets overlap heavily — the same show is often trending *and* popular
    // this season — so dedupe before sorting.
    Object.values(featured ?? {}).forEach((bucket: any) => {
      (bucket?.media ?? []).forEach((media: any) => {
        if (media?.nextAiringEpisode?.airingAt && !seen.has(media.id)) seen.set(media.id, media);
      });
    });

    return [...seen.values()]
      .filter((media) => media.nextAiringEpisode.airingAt - now < WEEK_SECONDS)
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
      <div className="airing__header">
        <h3>Airing this week</h3>
      </div>
      <div className="airing__row">
        {upcoming.map((media, index) => (
          <Link
            key={media.id}
            className="airing__card"
            to={mediaPath(media.id, media.title.userPreferred)}
            style={{
              // Falls back to the cover: plenty of titles have no banner art.
              backgroundImage: `url(${media.bannerImage ?? media.coverImage.extraLarge ?? media.coverImage.large})`,
            }}
          >
            <span className="airing__scrim" />
            {index === 0 && <span className="airing__flag">Next up</span>}
            <span className="airing__body">
              <span className="airing__title">
                {media.title.english ?? media.title.userPreferred}
              </span>
              <span className="airing__clock">
                {formatCountdown(media.nextAiringEpisode.airingAt - now)}
              </span>
              <span className="airing__episode">Episode {media.nextAiringEpisode.episode}</span>
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}

export default AiringThisWeek;
