import { useMemo, useState } from 'react';

import './ActivityHeatmap.css';

import { ActivityDay } from './types';

const DAYS = 371; // 53 weeks, so the grid always ends on a whole column
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const startOfDay = (ms: number) => {
  const d = new Date(ms);
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
};

/**
 * A year of watching, one square per day.
 *
 * AniList reports its own `level` per day, so the shading uses that rather than
 * bucketing `amount` again and disagreeing with AniList's own profile.
 *
 * Days are built from a continuous calendar rather than from the response:
 * activityHistory only contains days with activity, so iterating it would
 * silently close the gaps and turn a patchy year into a solid block.
 */
function ActivityHeatmap({ history }: { history: ActivityDay[] }) {
  // Read once on mount: Date.now() is impure during render, and the grid does
  // not need to roll over while you are looking at it.
  const [today] = useState(() => startOfDay(Date.now()));

  const { cells, months, total } = useMemo(() => {
    const byDay = new Map<number, ActivityDay>();
    history.forEach((day) => byDay.set(startOfDay(day.date * 1000), day));

    const built: { at: number; day?: ActivityDay }[] = [];
    for (let back = DAYS - 1; back >= 0; back -= 1) {
      const at = today - back * 86_400_000;
      built.push({ at, day: byDay.get(at) });
    }

    // A label per column where a new month starts, so the axis lines up with
    // the grid instead of being evenly spaced and wrong.
    const labels: { column: number; text: string }[] = [];
    built.forEach((cell, index) => {
      const date = new Date(cell.at);
      if (date.getUTCDate() <= 7 && index % 7 === 0) {
        labels.push({ column: index / 7, text: MONTHS[date.getUTCMonth()] });
      }
    });

    return {
      cells: built,
      months: labels,
      total: history.reduce((sum, day) => sum + day.amount, 0),
    };
  }, [history, today]);

  return (
    <div className="heatmap">
      <div className="heatmap__months" aria-hidden="true">
        {months.map((month) => (
          <span key={`${month.text}-${month.column}`} style={{ gridColumn: month.column + 1 }}>
            {month.text}
          </span>
        ))}
      </div>
      <div className="heatmap__grid" role="img" aria-label={`${total} updates in the past year`}>
        {cells.map((cell) => (
          <i
            key={cell.at}
            className={cell.day ? `heatmap__day heatmap__day--${cell.day.level}` : 'heatmap__day'}
            title={
              cell.day
                ? `${cell.day.amount} on ${new Date(cell.at).toUTCString().slice(5, 16)}`
                : undefined
            }
          />
        ))}
      </div>
      <div className="heatmap__key">
        <span>{total.toLocaleString()} updates this year</span>
        <span className="heatmap__scale">
          Less
          <i className="heatmap__day" />
          <i className="heatmap__day heatmap__day--1" />
          <i className="heatmap__day heatmap__day--2" />
          <i className="heatmap__day heatmap__day--3" />
          <i className="heatmap__day heatmap__day--4" />
          More
        </span>
      </div>
    </div>
  );
}

export default ActivityHeatmap;
