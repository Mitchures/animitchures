import { CSSProperties } from 'react';

import './GenreTiles.css';

import FrostedTile from 'components/FrostedTile';
import { useFitCount } from 'features/discover/useFitCount';
import { genreTile } from 'helpers';

interface Props {
  genres: { genre: string; count: number }[];
}

/**
 * A way into browsing, as eight portrait cards after Apple Music's "made for
 * you" tiles: the genre name set as the figure on slowly folding colour.
 *
 * The same `FrostedTile` as the page's widgets at its `tall` size, so there is
 * one object to learn rather than a lookalike. Each genre's colour and
 * treatment come from `GENRE_TILES`, which is why Action is the same red and
 * the same shape everywhere it appears. The count is not shown — it was a
 * stat on a door, and the door is the point.
 *
 * `--phase` offsets each tile's motion so the row never moves in unison; the
 * step is a prime share of the periods so no two tiles ever line up.
 *
 * Two rows, as many columns as fit: eight genres at the old 1180px, up to
 * twelve on a wide display. AniList has 18, so the rows are always full.
 */
function GenreTiles({ genres }: Props) {
  const [ref, cols] = useFitCount(230, 12, 4, 6);
  if (!genres.length) return null;

  return (
    <div ref={ref} className="genreTiles" style={{ '--cols': cols } as CSSProperties}>
      {genres.slice(0, cols * 2).map(({ genre }, index) => {
        const { treatment, palette } = genreTile(genre);
        return (
          <FrostedTile
            key={genre}
            size="tall"
            live
            treatment={treatment}
            palette={palette}
            style={{ '--phase': `-${(index * 11.3) % 47}s` } as CSSProperties}
            to={`/search/anime?genre=${encodeURIComponent(genre)}`}
          >
            <span className="genreTiles__title">{genre}</span>
          </FrostedTile>
        );
      })}
    </div>
  );
}

export default GenreTiles;
