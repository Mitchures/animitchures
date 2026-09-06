import { useMemo } from 'react';

import './RatingCurve.css';

import { ScoreBucket } from './types';

/** AniList's own mean across every scored entry on the site, out of 100. */
const SITE_MEAN = 69;

interface Props {
  scores: ScoreBucket[];
  /** The account's mean, on the same scale the buckets use. */
  mean: number;
}

/**
 * How you rate, as a distribution.
 *
 * The one place this page raises its voice. A mean on its own says almost
 * nothing — 76 could be a narrow band or a bimodal split — so this draws the
 * real buckets AniList returns and marks your mean against the site's. That
 * comparison is what makes the page about you rather than about what you
 * watched.
 */
function RatingCurve({ scores, mean }: Props) {
  const bars = useMemo(
    () => scores.filter((bucket) => bucket.score > 0).sort((a, b) => a.score - b.score),
    [scores],
  );

  if (!bars.length) return null;

  const peak = Math.max(...bars.map((bucket) => bucket.count), 1);
  const top = bars[bars.length - 1].score;
  // `scores` comes back on the account's own scale, so a 10-point account
  // reports 1-10 and the site's out-of-100 mean has to come down to meet it.
  const siteMean = top <= 5 ? SITE_MEAN / 20 : top <= 10 ? SITE_MEAN / 10 : SITE_MEAN;

  /**
   * Where a score sits along the plot, as a percentage.
   *
   * The bars are equal-width flex items, one per bucket — not a linear 0-100
   * axis — so a mark has to be placed by interpolating between bucket centres.
   * Treating the axis as 0-100 put both marks in the wrong place on every
   * account whose buckets are not evenly spaced.
   */
  const positionOf = (value: number) => {
    const step = 100 / bars.length;
    if (value <= bars[0].score) return step / 2;
    if (value >= top) return 100 - step / 2;

    const upper = bars.findIndex((bucket) => bucket.score >= value);
    const lower = upper - 1;
    const span = bars[upper].score - bars[lower].score || 1;
    const fraction = (value - bars[lower].score) / span;
    return (lower + 0.5 + fraction) * step;
  };

  return (
    <div className="ratingCurve">
      <div className="ratingCurve__plot">
        {bars.map((bucket) => (
          <div
            key={bucket.score}
            className="ratingCurve__bar"
            title={`${bucket.count} rated ${bucket.score}`}
          >
            <i
              className={bucket.count === peak ? 'is-peak' : undefined}
              style={{ height: `${Math.max(4, Math.round((bucket.count / peak) * 100))}%` }}
            />
            <span>{bucket.score}</span>
          </div>
        ))}

        <span
          className="ratingCurve__mark ratingCurve__mark--mine"
          style={{ left: `${positionOf(mean)}%` }}
        >
          <i />
          <em>you {Math.round(mean * 10) / 10}</em>
        </span>
        <span
          className="ratingCurve__mark ratingCurve__mark--site"
          style={{ left: `${positionOf(siteMean)}%` }}
        >
          <i />
          <em>site {Math.round(siteMean * 10) / 10}</em>
        </span>
      </div>
    </div>
  );
}

export { SITE_MEAN };
export default RatingCurve;
