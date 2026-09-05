export type ScoreTier = 'great' | 'good' | 'mixed' | 'poor';

/**
 * Buckets an AniList average score (0-100) into a severity tier.
 *
 * Shared so the hero badge and the Details sidebar cannot drift into disagreeing
 * about what counts as a good score. The boundaries follow how AniList scores
 * actually cluster — the distribution is heavily left-skewed, so 70 is average
 * rather than good, and anything at 85+ is genuinely well liked.
 */
export const scoreTier = (score: number): ScoreTier => {
  if (score >= 85) return 'great';
  if (score >= 70) return 'good';
  if (score >= 55) return 'mixed';
  return 'poor';
};
