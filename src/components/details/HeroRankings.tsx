import './HeroRankings.css';

import { Media, MediaRank } from 'graphql/types';

/** Only a top-100 placing is worth a badge; below that it is not a distinction. */
const WORTH_SHOWING = 100;

/**
 * "#1 Highest Rated 1998" — the kind of claim that belongs beside a title.
 *
 * AniList already returns these with the rest of the media, and the app has
 * never shown them. All-time placings come first because they are the stronger
 * statement, then seasonal and yearly ones.
 */
function HeroRankings({ rankings }: Media) {
  const ranked = (rankings ?? []).filter(
    (rank): rank is MediaRank => !!rank && !!rank.rank && rank.rank <= WORTH_SHOWING,
  );

  const badges = [...ranked]
    .sort((a, b) => Number(b.allTime) - Number(a.allTime) || a.rank - b.rank)
    .slice(0, 2);

  if (!badges.length) return null;

  return (
    <div className="heroRankings">
      {badges.map((rank) => (
        <span key={rank.id} className="heroRankings__badge">
          <b>#{rank.rank}</b>
          {/* `context` already reads as a phrase — "highest rated all time",
              "most popular" — so it needs a year appended only when it is not
              an all-time placing. */}
          <span>
            {rank.context}
            {!rank.allTime && rank.year ? ` ${rank.year}` : ''}
          </span>
        </span>
      ))}
    </div>
  );
}

export default HeroRankings;
