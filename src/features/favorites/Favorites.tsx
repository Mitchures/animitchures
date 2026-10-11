import { useEffect, useMemo } from 'react';
import { useQuery } from '@apollo/client';
import { motion } from 'framer-motion';
import { Category, FavoriteBorder, History, Star, Tv } from '@mui/icons-material';

import './Favorites.css';

import DotNumber from 'components/DotNumber';
import EpisodeRow from 'components/EpisodeRow';
import FactTile from 'components/FactTile';
import FrostedTile from 'components/FrostedTile';
import PosterEchoCard from 'components/PosterEchoCard';
import SectionHeading from 'components/SectionHeading';
import Chip from 'components/Chip';
import FavoritesSkeleton from 'features/favorites/FavoritesSkeleton';
import {
  Favorite,
  airingThisWeek,
  collectionStats,
  sortedByTitle,
  studioOf,
} from 'features/favorites/derive';
import { whenLabel } from 'features/discover/derive';
import { removeItemFromFavorites } from 'api';
import { useStateValue } from 'context';
import { DETAILS_LIST_QUERY } from 'graphql/queries';
import { genreTile } from 'helpers';

/**
 * AniList's ceiling for `perPage`. This was 15, which turned a 52-title list
 * into four round trips — each waiting on the one before — against a budget of
 * 30 requests a minute. At 50 the same list costs two.
 *
 * The e2e fixture holds three favourites and reports `hasNextPage: false`, so no
 * test ever walked the paging path; it took simulating a real list to see it.
 */
const PER_PAGE = 50;

/** Just the shape fetchMore has to merge — not the whole query result. */
type FavoritesPage = {
  Page?: { media?: Favorite[]; pageInfo?: { currentPage: number; hasNextPage: boolean } };
};

/**
 * The collection tile's colour is the Supernatural genre's — Mitchell's pick
 * over a colour derived from the covers, which would change every time a
 * favourite was added.
 */
const COLLECTION = genreTile('Supernatural');

/**
 * The favourites page, on the design system (2026-10-11, option B of the
 * companion mockups).
 *
 * It opens the way Discover does — a live frosted tile carrying the one figure,
 * four facts beside it, and a "next up" column of the favourites airing this
 * week — and only then lists the shelf. The page says something before it lists
 * something, and the column is the one reason to open it on a weeknight. When
 * nothing is airing the column is not rendered rather than rendered empty, and
 * the facts take its room.
 */
function Favorites() {
  const [{ favorites, user }, dispatch] = useStateValue();

  /**
   * Apollo accumulates the pages, rather than a local array built up in an
   * effect. The previous version appended each response into component state,
   * which meant two ways to show the wrong thing: the reducer rebuilds
   * `favorites` on every dispatch, so re-setting the same list restarted the
   * whole paged fetch, and each restart appended a second copy of every title
   * onto what was already on screen. Deep-equal variables make a repeat dispatch
   * free, and `fetchMore` owns the merging.
   */
  const { loading, data, fetchMore } = useQuery(DETAILS_LIST_QUERY, {
    variables: { id_in: favorites, type: 'ANIME', page: 1, perPage: PER_PAGE },
    skip: favorites.length === 0,
    notifyOnNetworkStatusChange: true,
  });

  const media: Favorite[] = useMemo(() => data?.Page?.media ?? [], [data]);
  const pageInfo = data?.Page?.pageInfo;
  const hasMore = Boolean(pageInfo?.hasNextPage);

  // Everything on one screen, so the next page is pulled as soon as a response
  // says there is one rather than waiting for a scroll.
  useEffect(() => {
    if (!hasMore || loading) return;

    fetchMore({
      variables: { page: (pageInfo?.currentPage ?? 1) + 1 },
      updateQuery: (
        previous: FavoritesPage,
        { fetchMoreResult }: { fetchMoreResult?: FavoritesPage },
      ) => {
        if (!fetchMoreResult) return previous;
        return {
          Page: {
            ...fetchMoreResult.Page,
            media: [...(previous?.Page?.media ?? []), ...(fetchMoreResult.Page?.media ?? [])],
          },
        };
      },
    });
  }, [hasMore, loading, pageInfo?.currentPage, fetchMore]);

  const now = useMemo(() => new Date(), []);
  const model = useMemo(() => {
    const stats = collectionStats(media);
    const airing = airingThisWeek(media, Math.floor(now.getTime() / 1000));
    const airingIds = new Set(airing.map((item) => item.id));
    return { stats, airing, airingIds, shelf: sortedByTitle(media) };
  }, [media, now]);
  const { stats, airing, airingIds, shelf } = model;

  const detail =
    airing.length === 0
      ? `${stats.count} ${stats.count === 1 ? 'title' : 'titles'}.`
      : `${stats.count} titles, ${airing.length} of them airing this week.`;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="favorites"
    >
      {favorites.length === 0 ? (
        // An empty list is not a loading state. It was wearing the loader —
        // spinner and all — which told you to wait for something that was
        // never coming.
        <>
          <SectionHeading title="Favorites" detail="Nothing here yet." />
          <p className="favorites__empty">Tap the heart on any title and it lands here.</p>
        </>
      ) : media.length === 0 ? (
        <FavoritesSkeleton count={Math.min(favorites.length, PER_PAGE)} />
      ) : (
        <>
          <SectionHeading title="Favorites" detail={detail} />

          <div
            className={`favorites__collection${airing.length ? '' : ' favorites__collection--quiet'}`}
          >
            <FrostedTile
              treatment={COLLECTION.treatment}
              palette={COLLECTION.palette}
              live
              className="favorites__tile"
            >
              <span className="favorites__tileLabel">Your favorites</span>
              <DotNumber value={stats.count} size="xl" className="favorites__tileFigure" />
              <span className="favorites__tileCaption">
                {stats.count === 1 ? 'title' : 'titles'}
                {stats.hours > 0 && ` · ${stats.hours} hours of them`}
              </span>
            </FrostedTile>

            <div className="favorites__facts">
              {stats.meanScore != null && (
                <FactTile icon={<Star />} label="Mean score" value={stats.meanScore} />
              )}
              {stats.episodes > 0 && (
                <FactTile icon={<Tv />} label="Episodes" value={stats.episodes} />
              )}
              {stats.topGenre && (
                <FactTile
                  icon={<Category />}
                  label="Leads the list"
                  value={stats.topGenre.count}
                  unit={stats.topGenre.genre}
                />
              )}
              {stats.oldest && (
                <FactTile
                  icon={<History />}
                  label="Oldest"
                  value={stats.oldest.year}
                  unit={stats.oldest.title}
                />
              )}
            </div>

            {airing.length > 0 && (
              <div className="favorites__nextUp">
                <h3 className="favorites__nextUpTitle">Next up</h3>
                {airing.map((item) => (
                  <EpisodeRow key={item.id} media={item} now={now} />
                ))}
              </div>
            )}
          </div>

          <SectionHeading title="The shelf" detail="A to Z." />
          <div className="favorites__shelf">
            {shelf.map((item) => {
              const studio = studioOf(item);
              const year = item.startDate?.year;
              const meta = [studio, year].filter(Boolean).join(' · ');
              const next = airingIds.has(item.id) ? item.nextAiringEpisode : null;
              return (
                <div key={item.id} className="favorites__card">
                  <PosterEchoCard
                    media={item}
                    meta={meta || undefined}
                    badge={
                      next ? (
                        <Chip tone="lime">
                          Ep {next.episode} · {whenLabel(next.airingAt, now).split(',')[0]}
                        </Chip>
                      ) : undefined
                    }
                  />
                  {user && (
                    <button
                      type="button"
                      className="favorites__remove"
                      aria-label={`Remove ${item.title.english ?? item.title.userPreferred} from favorites`}
                      onClick={() => removeItemFromFavorites(item.id, user.uid, dispatch)}
                    >
                      <FavoriteBorder />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
    </motion.div>
  );
}

export default Favorites;
