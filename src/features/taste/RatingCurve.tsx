import { useMemo } from 'react';

import './RatingCurve.css';

import { positionOf, scaleDivisor, usableBuckets, SITE_MEAN } from './curve';
import { ScoreBucket } from './types';

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

  /**
   * `scores` comes back on the account's own scale — a 10-point account
   * reports buckets of 6, 7, 8 — but `meanScore` is *always* out of 100,
   * whatever the format. Verified against live accounts: one reports a mean
   * of 79.75 against buckets that top out at 10. Both means therefore have to
   * be brought onto the bucket scale before either can be plotted; leaving
   * the user's alone pinned it to the far right of every non-100 account.
   */
  const divisor = top <= 5 ? 20 : top <= 10 ? 10 : 1;
  const plottedMean = mean / divisor;
  const siteMean = SITE_MEAN / divisor;

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
          style={{ left: `${positionOf(plottedMean)}%` }}
        >
          <i />
          <em>you {Math.round(plottedMean * 10) / 10}</em>
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
