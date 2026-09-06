import { useMemo } from 'react';
import { useQuery } from '@apollo/client';
import { motion } from 'framer-motion';

import './Watchlist.css';

import UpNextCard from './UpNextCard';
import ListRow from './ListRow';
import WatchlistSection, { PREVIEW_COUNT } from './WatchlistSection';
import WatchlistSkeleton from './WatchlistSkeleton';

import { useStateValue } from 'context';
import { ANILIST_USER_MEDIA_LIST_COLLECTION_QUERY } from 'graphql/queries';
import { ListStatus, ScoreFormat, WatchlistEntry } from './types';

/**
 * The order statuses are shown in, and what to call each one.
 *
 * "CURRENT" and "REPEATING" both mean you are part-way through something, so
 * they share the band at the top rather than being two near-identical lists.
 */
const SECTIONS: { status: ListStatus; label: string; tone: string }[] = [
  { status: 'COMPLETED', label: 'Completed', tone: 'completed' },
  { status: 'PLANNING', label: 'Planning to watch', tone: 'planning' },
  { status: 'PAUSED', label: 'Paused', tone: 'paused' },
  { status: 'DROPPED', label: 'Dropped', tone: 'dropped' },
];

const IN_PROGRESS: ListStatus[] = ['CURRENT', 'REPEATING'];

/** Most recently touched first — a watchlist is a record of what you did last. */
const byRecency = (a: WatchlistEntry, b: WatchlistEntry) => (b.updatedAt ?? 0) - (a.updatedAt ?? 0);

function Watchlist() {
  const [{ anilist_user, user }] = useStateValue();
  const { loading, data, error } = useQuery(ANILIST_USER_MEDIA_LIST_COLLECTION_QUERY, {
    variables: { userId: anilist_user?.id, userName: anilist_user?.name, type: 'ANIME' },
    skip: !anilist_user,
    pollInterval: 300_000, // 5 minutes
  });

  const collection = data?.MediaListCollection;

  /**
   * AniList returns one list per *section* the account has configured, and an
   * entry can appear in several of them — a split "Completed TV" and
   * "Completed Movie" are two lists, custom lists overlap the standard ones.
   * Flattening and keying by entry id is what stops a title being drawn twice.
   */
  const { inProgress, grouped, scoreFormat } = useMemo(() => {
    const entries = new Map<number, WatchlistEntry>();
    for (const list of collection?.lists ?? []) {
      for (const entry of list?.entries ?? []) {
        if (entry?.media) entries.set(entry.id, entry as WatchlistEntry);
      }
    }

    const all = [...entries.values()];
    const groups = new Map<ListStatus, WatchlistEntry[]>();
    for (const entry of all) {
      const bucket = groups.get(entry.status) ?? [];
      bucket.push(entry);
      groups.set(entry.status, bucket);
    }

    return {
      inProgress: all.filter((e) => IN_PROGRESS.includes(e.status)).sort(byRecency),
      grouped: groups,
      scoreFormat: (collection?.user?.mediaListOptions?.scoreFormat ?? null) as ScoreFormat | null,
    };
  }, [collection]);

  const total = [...grouped.values()].reduce((sum, list) => sum + list.length, 0);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="watchlist"
    >
      {!user?.anilistLinked ? (
        <p className="watchlist__empty">
          Link an AniList account in settings to see your watchlist here.
        </p>
      ) : loading && !collection ? (
        <WatchlistSkeleton />
      ) : error || !collection ? (
        <p className="watchlist__empty">
          We could not load your watchlist. It may be private, or the linked account may no longer
          exist.
        </p>
      ) : !total ? (
        <p className="watchlist__empty">
          Nothing on your list yet. Anything you add on a title&apos;s page shows up here.
        </p>
      ) : (
        <>
          {!!inProgress.length && (
            <WatchlistSection
              title="Up next"
              tone="current"
              items={inProgress}
              defaultExpanded={inProgress.length <= PREVIEW_COUNT * 2}
              render={(entry) => <UpNextCard entry={entry} />}
            />
          )}

          {SECTIONS.map(({ status, label, tone }) => (
            <WatchlistSection
              key={status}
              title={label}
              tone={tone}
              items={(grouped.get(status) ?? []).sort(byRecency)}
              render={(entry) => <ListRow entry={entry} scoreFormat={scoreFormat} />}
            />
          ))}
        </>
      )}
    </motion.div>
  );
}

export default Watchlist;
