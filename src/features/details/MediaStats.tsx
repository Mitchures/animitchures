import { BarChart } from '@mui/icons-material';

import './MediaStats.css';

import { Media } from 'graphql/types';

/** AniList's list statuses, in the order a show is actually worked through. */
const STATUS_ORDER = ['CURRENT', 'COMPLETED', 'PAUSED', 'DROPPED', 'PLANNING'] as const;

const STATUS_LABEL: Record<string, string> = {
  CURRENT: 'Watching',
  COMPLETED: 'Completed',
  PAUSED: 'Paused',
  DROPPED: 'Dropped',
  PLANNING: 'Planning',
};

/**
 * The five statuses, as a run of one hue.
 *
 * They were five unrelated colours from the old palette — indigo, green, amber
 * — which read as five categories with opinions about each other. A single hue
 * stepping in lightness says what this actually is: shares of one whole, in
 * order. Completed is the darkest because it is both the largest share and the
 * end of the sequence.
 */
const STATUS_COLOR: Record<string, string> = {
  COMPLETED: 'color-mix(in srgb, var(--ink) 72%, transparent)',
  CURRENT: 'color-mix(in srgb, var(--ink) 55%, transparent)',
  PLANNING: 'color-mix(in srgb, var(--ink) 38%, transparent)',
  PAUSED: 'color-mix(in srgb, var(--ink) 25%, transparent)',
  DROPPED: 'color-mix(in srgb, var(--ink) 14%, transparent)',
};

const format = (value: number) => value.toLocaleString();

/**
 * What the community did with this show, and how they scored it.
 *
 * Both distributions come back with the rest of the media and were never
 * rendered. Drawn with CSS rather than a charting dependency — two bar charts
 * do not justify one, and the app ships a ~1MB bundle already.
 */
function MediaStats({ stats }: Media) {
  const scores = (stats?.scoreDistribution ?? []).filter((entry) => !!entry);
  const statuses = (stats?.statusDistribution ?? []).filter((entry) => !!entry);
  if (!scores.length && !statuses.length) return null;

  const peak = Math.max(...scores.map((entry) => entry!.amount ?? 0), 1);
  const totalStatus = statuses.reduce((sum, entry) => sum + (entry!.amount ?? 0), 0);

  const ordered = [...statuses].sort(
    (a, b) =>
      STATUS_ORDER.indexOf(a!.status as (typeof STATUS_ORDER)[number]) -
      STATUS_ORDER.indexOf(b!.status as (typeof STATUS_ORDER)[number]),
  );

  return (
    <div className="mediaStats">
      <h3>
        <BarChart />
        Community
      </h3>

      {scores.length > 0 && (
        <div className="mediaStats__block">
          <p className="mediaStats__caption">Score distribution</p>
          <div className="mediaStats__scores">
            {scores.map((entry) => (
              <div
                key={entry!.score}
                className="mediaStats__bar"
                title={`${format(entry!.amount ?? 0)} gave it ${entry!.score}`}
              >
                <div
                  className={`mediaStats__barFill${
                    (entry!.amount ?? 0) === peak ? ' mediaStats__barFill--peak' : ''
                  }`}
                  // Heights are relative to the tallest bucket, not to the
                  // total: against the total, every bar would be a sliver.
                  style={{ height: `${((entry!.amount ?? 0) / peak) * 100}%` }}
                />
                <span className="mediaStats__barLabel">{entry!.score}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {totalStatus > 0 && (
        <div className="mediaStats__block">
          <p className="mediaStats__caption">{format(totalStatus)} people have this on a list</p>
          <div className="mediaStats__stack">
            {ordered.map((entry) => (
              <div
                key={entry!.status}
                className="mediaStats__segment"
                style={{
                  width: `${((entry!.amount ?? 0) / totalStatus) * 100}%`,
                  backgroundColor: STATUS_COLOR[entry!.status as string],
                }}
                title={`${STATUS_LABEL[entry!.status as string]}: ${format(entry!.amount ?? 0)}`}
              />
            ))}
          </div>
          <div className="mediaStats__legend">
            {ordered.map((entry) => (
              <span key={entry!.status} className="mediaStats__key">
                <i
                  className="mediaStats__dot"
                  style={{ backgroundColor: STATUS_COLOR[entry!.status as string] }}
                />
                {STATUS_LABEL[entry!.status as string]} <b>{format(entry!.amount ?? 0)}</b>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default MediaStats;
