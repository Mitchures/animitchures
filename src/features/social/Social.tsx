import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import { motion } from 'framer-motion';

import './Social.css';

import SectionHeading from 'components/SectionHeading';
import EpisodeStrip from 'features/watchlist/EpisodeStrip';
import SocialSkeleton from './SocialSkeleton';

import { useStateValue } from 'context';
import { SOCIAL_FEED_QUERY } from 'graphql/queries';
import { authHeader, mediaPath } from 'helpers';
import { FeedActivity, SocialUser } from './types';
import { activeToday, milestoneOf, phraseOf, progressOf, sinceLabel } from './activity';

const STRIP_MAX_TICKS = 26;

function Social() {
  const [{ user, anilist_user }] = useStateValue();
  // Impure during render, and the React Compiler rejects it.
  const [now] = useState(() => Math.floor(Date.now() / 1000));

  const { data, loading, error, fetchMore } = useQuery(SOCIAL_FEED_QUERY, {
    variables: { userId: anilist_user?.id, page: 1 },
    skip: !user?.anilistLinked || !anilist_user,
    // `isFollowing: true` is relative to the authenticated viewer. Without
    // the token AniList has no idea who "you" are and answers with something
    // else entirely — it still returns activities, which is what makes this
    // easy to miss.
    context: { headers: authHeader() },
  });

  const following: SocialUser[] = data?.following?.following ?? [];
  // Same as the calendar: `activities` has no isAdult argument either, so
  // adult titles are dropped here rather than never fetched.
  const activities: FeedActivity[] = (data?.feed?.activities ?? []).filter(
    (activity: FeedActivity) => activity?.user && (user?.isAdult || !activity.media?.isAdult),
  );
  const pageInfo = data?.feed?.pageInfo;
  const live = useMemo(() => activeToday(activities, now), [activities, now]);

  if (!user?.anilistLinked) {
    return (
      <p className="social__empty">
        Link an AniList account in settings to see what the people you follow have been watching.
      </p>
    );
  }
  if (loading && !activities.length) return <SocialSkeleton />;
  if (error) return <p className="social__empty">We could not load your feed.</p>;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="social"
    >
      {!!following.length && (
        <>
          <SectionHeading
            title="Following"
            detail={`${following.length} people · ${live.size} active today`}
          />
          <div className="social__faces scrollerX">
            {following.map((person) => (
              <span
                key={person.id}
                className={`social__face${live.has(person.id) ? ' is-live' : ''}`}
                title={person.name}
              >
                <img src={person.avatar?.large ?? ''} alt="" loading="lazy" />
                <span>{person.name}</span>
              </span>
            ))}
          </div>
        </>
      )}

      <SectionHeading title="Lately" detail="newest first" />

      {!activities.length ? (
        <p className="social__empty social__empty--inline">
          Nothing yet. Follow people on AniList and their activity shows up here.
        </p>
      ) : (
        <div className="social__feed">
          {activities.map((activity) => {
            const milestone = milestoneOf(activity);
            const progress = progressOf(activity);
            const media = activity.media;

            // A text post is a different shape: it has no media, no progress,
            // and its content is the point rather than a side note.
            if (!media) {
              return (
                <article key={activity.id} className="social__row social__row--text">
                  <img className="social__avatar" src={activity.user?.avatar?.large ?? ''} alt="" />
                  <div className="social__body">
                    <p className="social__line">
                      <b>{activity.user?.name}</b> posted
                    </p>
                    <p className="social__text">{activity.text}</p>
                  </div>
                  <em className="social__when">{sinceLabel(activity.createdAt, now)}</em>
                </article>
              );
            }

            return (
              <article
                key={activity.id}
                className={`social__row${milestone ? ' is-milestone' : ''}`}
              >
                <img className="social__avatar" src={activity.user?.avatar?.large ?? ''} alt="" />
                <div className="social__body">
                  <p className="social__line">
                    <b>{activity.user?.name}</b> {phraseOf(activity)}{' '}
                    <Link to={mediaPath(media.id, media.title.userPreferred)}>
                      {media.title.userPreferred}
                    </Link>
                  </p>
                  <span className="social__strip">
                    <EpisodeStrip
                      progress={progress}
                      episodes={media.episodes}
                      maxTicks={STRIP_MAX_TICKS}
                    />
                  </span>
                  <span className="social__meta">
                    {progress}
                    <i>/{media.episodes ?? '?'}</i>
                    {milestone && (
                      <span className={`social__badge social__badge--${milestone}`}>
                        {milestone}
                      </span>
                    )}
                  </span>
                </div>
                <Link
                  className="social__poster"
                  to={mediaPath(media.id, media.title.userPreferred)}
                  tabIndex={-1}
                >
                  <img src={media.coverImage.large} alt="" loading="lazy" />
                </Link>
                <em className="social__when">{sinceLabel(activity.createdAt, now)}</em>
              </article>
            );
          })}
        </div>
      )}

      {pageInfo?.hasNextPage && (
        <button
          type="button"
          className="social__more"
          onClick={() =>
            fetchMore({
              variables: { page: pageInfo.currentPage + 1 },
              updateQuery: (prev, { fetchMoreResult }) => {
                if (!fetchMoreResult?.feed) return prev;
                return {
                  ...prev,
                  feed: {
                    ...fetchMoreResult.feed,
                    activities: [
                      ...(prev.feed?.activities ?? []),
                      ...fetchMoreResult.feed.activities,
                    ],
                  },
                };
              },
            })
          }
        >
          Show more
        </button>
      )}
    </motion.div>
  );
}

export default Social;
