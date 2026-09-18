import './GenreTiles.css';

import FrostedTile from 'components/FrostedTile';
import DotNumber from 'components/DotNumber';
import { genreTile } from 'helpers';

interface Props {
  genres: { genre: string; count: number }[];
}

/**
 * A way into browsing, as eight small frosted tiles.
 *
 * The same `FrostedTile` as the page's widgets at its `sm` size, so there is one
 * object to learn rather than a lookalike. Each genre's colour and treatment
 * come from `GENRE_TILES`, which is why Action is the same red and the same
 * shape everywhere it appears.
 *
 * It sits late on the page deliberately: this is a way out of Discover rather
 * than something to read.
 */
function GenreTiles({ genres }: Props) {
  if (!genres.length) return null;

  return (
    <div className="genreTiles">
      {genres.map(({ genre, count }) => {
        const { treatment, palette } = genreTile(genre);
        return (
          <FrostedTile
            key={genre}
            size="sm"
            treatment={treatment}
            palette={palette}
            label={genre}
            caption="titles"
            to={`/search/anime?genre=${encodeURIComponent(genre)}`}
          >
            <DotNumber value={count} />
          </FrostedTile>
        );
      })}
    </div>
  );
}

export default GenreTiles;
