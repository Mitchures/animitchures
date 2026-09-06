import Avatar from '@mui/material/Avatar';
import { Link } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import { motion } from 'framer-motion';

import './Profile.css';

import SectionHeading from 'components/SectionHeading';
import ActivityHeatmap from './ActivityHeatmap';
import GenreOverview from './GenreOverview';
import ProfileSkeleton from './ProfileSkeleton';

import { useStateValue } from 'context';
import { ANILIST_USER_AND_ACTIVITY_QUERY } from 'graphql/queries';
import { mediaPath } from 'helpers';
import { AnilistProfile, ListActivity } from './types';

const MINUTES_PER_DAY = 60 * 24;
const FAVOURITES_SHOWN = 8;
const ACTIVITY_SHOWN = 5;

/**
 * A yardstick for "how much is 59,184 minutes?". Twenty-four minutes is a
 * standard TV episode, so this reads as "that many episodes of anything".
 */
const REFERENCE = { title: 'Cowboy Bebop', minutes: 26 * 24 };

const relativeDay = (seconds: number) => {
  const days = Math.round((Date.now() - seconds * 1000) / 86_400_000);
  if (days <= 0) return 'today';
  if (days === 1) return 'yesterday';
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} week${days < 14 ? '' : 's'} ago`;
  return `${Math.floor(days / 30)} month${days < 60 ? '' : 's'} ago`;
};

function Profile() {
  const [{ user, anilist_user }] = useStateValue();
  const { data, loading } = useQuery(ANILIST_USER_AND_ACTIVITY_QUERY, {
    variables: { id: anilist_user?.id, name: anilist_user?.name },
    skip: !user?.anilistLinked,
  });

  const profile: AnilistProfile | undefined = data?.User ?? undefined;
  const stats = profile?.statistics?.anime;
  const activity: ListActivity[] = (data?.Page?.activities ?? []).filter(
    (entry: ListActivity) => entry?.media,
  );
  const favourites = (profile?.favourites?.anime?.edges ?? []).slice(0, FAVOURITES_SHOWN);

  const minutes = stats?.minutesWatched ?? 0;
  const days = Math.round(minutes / MINUTES_PER_DAY);
  const overs = Math.round(minutes / REFERENCE.minutes);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="profile"
    >
      {user && (
        <>
          <div
            className="profile__banner"
            style={
              profile?.bannerImage ? { backgroundImage: `url(${profile.bannerImage})` } : undefined
            }
          >
            <span className="profile__scrim" />
          </div>

          <div className="profile__identity">
            <Avatar
              className="profile__avatar"
              alt={user.displayName || user.email || 'Account'}
              src={profile?.avatar?.large ?? user.photoURL ?? undefined}
            >
              {(user.displayName || user.email || 'A').charAt(0).toUpperCase()}
            </Avatar>
            <div className="profile__name">
              <h1>{user.displayName || profile?.name || user.email}</h1>
              {profile?.createdAt && (
                <p>
                  On AniList since{' '}
                  {new Date(profile.createdAt * 1000).toLocaleDateString(undefined, {
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
              )}
            </div>
          </div>

          {loading && !profile && <ProfileSkeleton />}

          <div className="profile__body">
            {!user.anilistLinked && (
              <p className="profile__empty">
                Link an AniList account in settings to see your watching history here.
              </p>
            )}

            {user.anilistLinked && !profile && !loading && (
              <p className="profile__empty">
                We could not load your AniList profile. It may be private, or the linked account may
                no longer exist.
              </p>
            )}

            {!loading && stats && (
              <>
                <div className="profile__lede">
                  <b>{days}</b>
                  <span>days watched</span>
                </div>
                <p className="profile__gloss">
                  {minutes.toLocaleString()} minutes across{' '}
                  {(stats.episodesWatched ?? 0).toLocaleString()} episodes — that is{' '}
                  <em>
                    {REFERENCE.title}, {overs} times over
                  </em>
                  .
                </p>

                <div className="profile__vitals">
                  <div>
                    <b>{(stats.count ?? 0).toLocaleString()}</b>
                    <span>titles completed</span>
                  </div>
                  <div>
                    <b>{(stats.episodesWatched ?? 0).toLocaleString()}</b>
                    <span>episodes</span>
                  </div>
                  <div>
                    <b>{Math.round(stats.meanScore ?? 0)}</b>
                    <span>mean score</span>
                  </div>
                  <div>
                    <b>{(stats.standardDeviation ?? 0).toFixed(1)}</b>
                    <span>score spread</span>
                  </div>
                </div>
              </>
            )}

            {!!profile?.stats?.activityHistory?.length && (
              <section className="profile__section">
                <SectionHeading title="Activity" detail="past year" />
                <ActivityHeatmap history={profile.stats.activityHistory} />
              </section>
            )}

            {!!stats?.genrePreview?.length && (
              <section className="profile__section">
                <SectionHeading title="What you watch" detail="share of everything watched" />
                <GenreOverview genres={stats.genrePreview} />
              </section>
            )}

            {!!favourites.length && (
              <section className="profile__section">
                <SectionHeading title="Favourites" detail="from your AniList" />
                <div className="profile__favourites">
                  {favourites.map(({ node }) => (
                    <Link
                      key={node.id}
                      to={mediaPath(node.id, node.title.userPreferred)}
                      title={node.title.userPreferred}
                    >
                      <img
                        src={node.coverImage?.large ?? ''}
                        alt={node.title.userPreferred}
                        loading="lazy"
                      />
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {!!activity.length && (
              <section className="profile__section">
                <SectionHeading title="Recently" />
                <div className="profile__feed">
                  {activity.slice(0, ACTIVITY_SHOWN).map((entry) => (
                    <Link
                      key={entry.id}
                      className="profile__feedRow"
                      to={mediaPath(entry.media!.id, entry.media!.title.userPreferred)}
                    >
                      <img src={entry.media!.coverImage?.large ?? ''} alt="" loading="lazy" />
                      <span>
                        {entry.status}
                        {entry.progress ? ` ${entry.progress}` : ''} of{' '}
                        <b>{entry.media!.title.userPreferred}</b>
                      </span>
                      <em>{relativeDay(entry.createdAt)}</em>
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </div>
        </>
      )}
    </motion.div>
  );
}

export default Profile;
