import { FeedActivity, Milestone } from './types';

/**
 * `progress` arrives as a string, and for a batch it is a range: "5 - 8".
 * The last number is where they actually are.
 */
export const progressOf = (activity: FeedActivity): number => {
  const raw = activity.progress;
  if (!raw) return 0;
  const parts = `${raw}`.split('-').map((part) => Number(part.trim()));
  const last = parts[parts.length - 1];
  return Number.isFinite(last) ? last : 0;
};

/**
 * Which activities are worth lifting out of the stream.
 *
 * The feed is 99% "watched episode N". Finishing something, starting it,
 * or giving up on it are the events a person would actually mention, so
 * they get weight and everything else stays quiet. Without this the feed is
 * a wall in which completing a 24-episode series looks exactly like watching
 * one more episode of it.
 */
export const milestoneOf = (activity: FeedActivity): Milestone => {
  const status = (activity.status ?? '').toLowerCase();
  if (status.includes('completed')) return 'completed';
  if (status.includes('plans to') || status.includes('planning')) return 'started';
  if (status.includes('dropped')) return 'dropped';
  if (status.includes('paused')) return 'paused';
  if (status.includes('rewatched') || status.includes('repeating')) return 'rewatched';
  return null;
};

/** The sentence fragment after the username. */
export const phraseOf = (activity: FeedActivity): string => {
  const milestone = milestoneOf(activity);
  const progress = progressOf(activity);
  switch (milestone) {
    case 'completed':
      return 'finished';
    case 'started':
      return 'plans to watch';
    case 'dropped':
      return 'dropped';
    case 'paused':
      return 'paused';
    case 'rewatched':
      return 'rewatched';
    default:
      return progress ? `watched ep ${progress}` : (activity.status ?? 'updated');
  }
};

const MINUTE = 60;
const HOUR = 3600;
const DAY = 86_400;

export const sinceLabel = (createdAt: number, now: number): string => {
  const elapsed = Math.max(0, now - createdAt);
  if (elapsed < MINUTE) return 'now';
  if (elapsed < HOUR) return `${Math.floor(elapsed / MINUTE)}m`;
  if (elapsed < DAY) return `${Math.floor(elapsed / HOUR)}h`;
  if (elapsed < DAY * 7) return `${Math.floor(elapsed / DAY)}d`;
  return `${Math.floor(elapsed / (DAY * 7))}w`;
};

/** Active in the last day — what the ring on a following avatar means. */
export const activeToday = (activities: FeedActivity[], now: number): Set<number> => {
  const ids = new Set<number>();
  for (const activity of activities) {
    if (activity.user && now - activity.createdAt < DAY) ids.add(activity.user.id);
  }
  return ids;
};
