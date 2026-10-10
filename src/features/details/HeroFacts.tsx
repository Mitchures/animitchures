import { ReactNode } from 'react';
import { EmojiEvents, Favorite, Star, Tv } from '@mui/icons-material';

import './HeroFacts.css';

import FactTile from 'components/FactTile';

import { compactCount } from 'features/discover/derive';
import { Media, MediaRank } from 'graphql/types';

/** Below this a placing is not a distinction, so it is not worth a tile. */
const WORTH_SHOWING = 100;

/**
 * The four figures worth scanning, as the reference's nested squircles.
 *
 * This replaced `HeroMeta`'s chip row and `HeroRankings`' badges, which between
 * them said format, episodes, runtime, status and two rankings — six things in
 * two registers, none of them prominent. Four tiles with icon chips are
 * scannable; the rest of the fields were already in the sidebar.
 *
 * A tile is dropped rather than rendered empty: plenty of titles have no score,
 * and an unaired one has no ranking at all.
 */
function HeroFacts({ media }: { media: Media }) {
  const ranked = (media.rankings ?? []).filter(
    (rank): rank is MediaRank => Boolean(rank?.rank) && rank!.rank <= WORTH_SHOWING,
  );
  // All-time placings first: they are the stronger claim.
  const best = [...ranked].sort(
    (a, b) => Number(b.allTime) - Number(a.allTime) || a.rank - b.rank,
  )[0];

  const tiles = [
    media.averageScore && {
      key: 'score',
      icon: <Star />,
      label: 'Average score',
      value: media.averageScore,
      unit: 'of 100',
      // The one lime in the set: the score is what the page is most often
      // opened to find.
      accent: true,
    },
    media.favourites && {
      key: 'favourites',
      icon: <Favorite />,
      label: 'Favourited',
      value: compactCount(media.favourites),
      unit: 'people',
    },
    media.episodes && {
      key: 'episodes',
      icon: <Tv />,
      label: 'Episodes',
      value: media.episodes,
      unit: media.duration ? `× ${media.duration} min` : undefined,
    },
    best && {
      key: 'rank',
      icon: <EmojiEvents />,
      label: best.allTime ? 'All-time rank' : `Rank in ${best.year ?? 'its season'}`,
      value: `#${best.rank}`,
      unit: best.context.replace(' all time', ''),
    },
  ].filter(Boolean) as {
    key: string;
    icon: ReactNode;
    label: string;
    value: number | string;
    unit?: string;
    accent?: boolean;
  }[];

  if (!tiles.length) return null;

  return (
    <div className="heroFacts">
      {tiles.map((tile) => (
        <FactTile
          key={tile.key}
          icon={tile.icon}
          label={tile.label}
          value={tile.value}
          unit={tile.unit}
          accent={tile.accent}
        />
      ))}
    </div>
  );
}

export default HeroFacts;
