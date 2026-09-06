import { ScoreBucket } from './types';

/** AniList's own mean across every scored entry on the site, out of 100. */
export const SITE_MEAN = 69;

/**
 * How many points of a 100-point score one point of this account's scale is
 * worth.
 *
 * `scores` comes back on the account's own format — a 5-point account reports
 * buckets of 3, 4, 5 — while `meanScore` is always out of 100 regardless.
 * Verified against live accounts: one reports a mean of 79.75 against buckets
 * topping out at 10.
 */
export const scaleDivisor = (buckets: ScoreBucket[]): number => {
  const top = Math.max(...buckets.map((bucket) => bucket.score), 0);
  if (top <= 5) return 20;
  if (top <= 10) return 10;
  return 1;
};

/** Ascending, with unscored entries dropped — bucket 0 is "not rated". */
export const usableBuckets = (buckets: ScoreBucket[]): ScoreBucket[] =>
  buckets.filter((bucket) => bucket.score > 0).sort((a, b) => a.score - b.score);

/**
 * Where a score sits along the plot, as a percentage of its width.
 *
 * The bars are equal-width flex items, one per bucket — not a linear 0-100
 * axis — and real distributions are sparse and irregular (a live account has
 * buckets 70, 90, 95, 100 and nothing else). So a mark is placed by
 * interpolating between bucket centres; treating the axis as linear put both
 * marks in the wrong place on almost every account.
 */
export const positionOf = (buckets: ScoreBucket[], value: number): number => {
  const bars = usableBuckets(buckets);
  if (!bars.length) return 0;

  const step = 100 / bars.length;
  const first = bars[0].score;
  const last = bars[bars.length - 1].score;

  if (value <= first) return step / 2;
  if (value >= last) return 100 - step / 2;

  const upper = bars.findIndex((bucket) => bucket.score >= value);
  const lower = upper - 1;
  const span = bars[upper].score - bars[lower].score || 1;
  const fraction = (value - bars[lower].score) / span;
  return (lower + 0.5 + fraction) * step;
};
