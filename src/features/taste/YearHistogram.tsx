import './YearHistogram.css';

import { YearBucket } from './types';

/**
 * What you watched, by the year it came out.
 *
 * Not a top-N list: the shape across the whole span is the point — whether
 * you watch broadly or live in one era — so every year with anything in it
 * gets a column, however short.
 */
function YearHistogram({ years }: { years: YearBucket[] }) {
  const sorted = [...years].sort((a, b) => a.releaseYear - b.releaseYear);
  if (!sorted.length) return null;
  const peak = Math.max(...sorted.map((bucket) => bucket.count), 1);

  return (
    <div className="yearHistogram">
      {sorted.map((bucket) => (
        <div
          key={bucket.releaseYear}
          className="yearHistogram__col"
          title={`${bucket.count} from ${bucket.releaseYear}`}
        >
          <i style={{ height: `${Math.max(3, Math.round((bucket.count / peak) * 100))}%` }} />
          {/* Two digits: a full year under a 10px column is unreadable, and
              the decade is legible from its neighbours. */}
          <span>{`${bucket.releaseYear}`.slice(2)}</span>
        </div>
      ))}
    </div>
  );
}

export default YearHistogram;
