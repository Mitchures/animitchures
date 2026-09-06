import { useMemo } from 'react';
import { Link } from 'react-router-dom';

import './GenreTiles.css';

import { Featured, FeaturedBucket, FeaturedMedia } from 'graphql/featured';

import SectionHeading from 'components/SectionHeading';

const TILE_COUNT = 8;

/**
 * Gradients keyed by genre name rather than by position, so a genre keeps its
 * colour as the trending data shifts underneath it.
 */
const GRADIENTS = [
  'linear-gradient(135deg, #6366f1, #9b50f4)',
  'linear-gradient(135deg, #f345ae, #f59e0b)',
  'linear-gradient(135deg, #26ae7f, #6366f1)',
  'linear-gradient(135deg, #9b50f4, #f345ae)',
  'linear-gradient(135deg, #f59e0b, #ff5657)',
  'linear-gradient(135deg, #0ea5e9, #6366f1)',
  'linear-gradient(135deg, #ff5657, #9b50f4)',
  'linear-gradient(135deg, #14b8a6, #0ea5e9)',
];

const gradientFor = (genre: string) => {
  let hash = 0;
  for (let i = 0; i < genre.length; i += 1) hash = (hash * 31 + genre.charCodeAt(i)) >>> 0;
  return GRADIENTS[hash % GRADIENTS.length];
};

/**
 * Genres to browse, ranked by how often they appear across everything already
 * loaded for the rails — so the shortcuts reflect what is actually on right
 * now rather than a hardcoded list that slowly goes stale.
 */
function GenreTiles({ featured }: { featured: Featured }) {
  const genres = useMemo(() => {
    const counts = new Map<string, number>();
    Object.values(featured ?? {}).forEach((bucket: FeaturedBucket | undefined) => {
      (bucket?.media ?? []).forEach((media: FeaturedMedia) => {
        (media?.genres ?? []).forEach((genre: string) => {
          counts.set(genre, (counts.get(genre) ?? 0) + 1);
        });
      });
    });

    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .slice(0, TILE_COUNT)
      .map(([genre]) => genre);
  }, [featured]);

  if (!genres.length) return null;

  return (
    <section className="genreTiles">
      <SectionHeading title="Browse by genre" />
      <div className="genreTiles__grid">
        {genres.map((genre) => (
          <Link
            key={genre}
            className="genreTiles__tile"
            style={{ backgroundImage: gradientFor(genre) }}
            to={`/search/anime?genre=${encodeURIComponent(genre)}`}
          >
            {genre}
          </Link>
        ))}
      </div>
    </section>
  );
}

export default GenreTiles;
