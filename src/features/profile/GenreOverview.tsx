import './GenreOverview.css';

import { GenreStat } from './types';

const SHOWN = 5;

/**
 * Assigned by rank rather than hashed from the name.
 *
 * Hashing keeps a genre's colour stable as the counts shift underneath it,
 * which sounds better until two of your top five hash to the same swatch —
 * which they did. With only five shown, telling them apart matters more than
 * the colour being the one you saw last month.
 */
const COLOURS = ['#8be28b', '#4cc2ff', '#9b7bf5', '#f58bb0', '#f5a623'];

function GenreOverview({ genres }: { genres: GenreStat[] }) {
  const top = genres.slice(0, SHOWN);
  if (!top.length) return null;

  const rest = genres.slice(SHOWN).reduce((sum, entry) => sum + entry.count, 0);

  return (
    <div className="genreOverview">
      <div className="genreOverview__row">
        {top.map((entry, index) => (
          <div key={entry.genre} className="genreOverview__item">
            <span className="genreOverview__chip" style={{ backgroundColor: COLOURS[index] }}>
              {entry.genre}
            </span>
            <span className="genreOverview__count" style={{ color: COLOURS[index] }}>
              {entry.count.toLocaleString()} <em>entries</em>
            </span>
          </div>
        ))}
      </div>
      {/* The bar includes everything outside the top five, so the widths are a
          true share rather than a share of the five shown. */}
      <div className="genreOverview__bar">
        {top.map((entry, index) => (
          <i key={entry.genre} style={{ flexGrow: entry.count, backgroundColor: COLOURS[index] }} />
        ))}
        {rest > 0 && <i style={{ flexGrow: rest }} className="genreOverview__rest" />}
      </div>
    </div>
  );
}

export default GenreOverview;
