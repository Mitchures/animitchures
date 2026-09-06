import { Link } from 'react-router-dom';

import './RankedBars.css';

interface Row {
  key: string | number;
  label: string;
  count: number;
  /** Shown on the right in gold when the stat carries a mean score. */
  score?: number | null;
  to?: string;
}

/**
 * A ranked list with the count drawn as a bar.
 *
 * Deliberately quiet: the rating curve is the loud thing on this page, and
 * five of these competing with it would turn the whole page into a chart.
 */
function RankedBars({ rows }: { rows: Row[] }) {
  if (!rows.length) return null;
  const max = Math.max(...rows.map((row) => row.count), 1);

  return (
    <div className="rankedBars">
      {rows.map((row, index) => {
        const label = row.to ? (
          <Link className="rankedBars__label" to={row.to}>
            {row.label}
          </Link>
        ) : (
          <span className="rankedBars__label">{row.label}</span>
        );

        return (
          <div key={row.key} className="rankedBars__row">
            <b className="rankedBars__rank">{index + 1}</b>
            {label}
            <span className="rankedBars__track">
              <i style={{ width: `${Math.round((row.count / max) * 100)}%` }} />
            </span>
            <span className="rankedBars__count">{row.count}</span>
            {row.score ? (
              <span className="rankedBars__score">{Math.round(row.score)}</span>
            ) : (
              <span className="rankedBars__score" />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default RankedBars;
