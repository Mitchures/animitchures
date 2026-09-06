import { Link } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import { motion } from 'framer-motion';

import './Taste.css';

import SectionHeading from 'components/SectionHeading';
import RatingCurve, { SITE_MEAN } from './RatingCurve';
import RankedBars from './RankedBars';
import YearHistogram from './YearHistogram';
import TasteSkeleton from './TasteSkeleton';

import { useStateValue } from 'context';
import { TASTE_QUERY } from 'graphql/queries';
import { staffPath, studioPath, titleCase } from 'helpers';
import { TasteUser } from './types';

const FORMATS_SHOWN = 5;

/** "TV", "OVA" read fine; "MOVIE" and "SPECIAL" should not shout. */
const formatLabel = (format: string) =>
  format === 'TV' || format === 'OVA' || format === 'ONA' ? format : titleCase(format);

function Taste() {
  const [{ user, anilist_user }] = useStateValue();
  const { data, loading, error } = useQuery(TASTE_QUERY, {
    variables: { id: anilist_user?.id, name: anilist_user?.name },
    skip: !user?.anilistLinked || !anilist_user,
  });

  const profile: TasteUser | undefined = data?.User;
  const stats = profile?.statistics?.anime;

  if (!user?.anilistLinked) {
    return (
      <p className="taste__empty">
        Link an AniList account in settings and this fills in with how you rate, what you return to,
        and who you have heard most.
      </p>
    );
  }
  if (loading && !stats) return <TasteSkeleton />;
  if (error || !stats) {
    return <p className="taste__empty">We could not load your statistics.</p>;
  }

  const totalScored = stats.scores.reduce((sum, bucket) => sum + bucket.count, 0);
  const gap = Math.round(stats.meanScore - SITE_MEAN);
  const formats = stats.formats.slice(0, FORMATS_SHOWN);
  const formatTotal = stats.formats.reduce((sum, bucket) => sum + bucket.count, 0) || 1;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="taste"
    >
      <header className="taste__hero">
        <div className="taste__lede">
          <h1>How you rate</h1>
          <p>
            {totalScored.toLocaleString()} scored titles. Your mean is{' '}
            <b>{Math.round(stats.meanScore)}</b>; the site&apos;s is <b>{SITE_MEAN}</b> —{' '}
            {gap === 0 ? (
              <>you land exactly on the average</>
            ) : (
              <>
                you are{' '}
                <b>
                  {Math.abs(gap)} point{Math.abs(gap) === 1 ? '' : 's'}{' '}
                  {gap > 0 ? 'more generous' : 'harsher'}
                </b>{' '}
                than average
              </>
            )}
            .
          </p>
        </div>
        <RatingCurve scores={stats.scores} mean={stats.meanScore} />
      </header>

      <div className="taste__body">
        <div className="taste__columns">
          <section>
            <SectionHeading title="Studios you return to" detail="with your mean for each" />
            <RankedBars
              rows={stats.studios.map((bucket) => ({
                key: bucket.studio.id,
                label: bucket.studio.name,
                count: bucket.count,
                score: bucket.meanScore,
                to: studioPath(bucket.studio.id, bucket.studio.name),
              }))}
            />
          </section>

          <section>
            <SectionHeading title="Voices you hear most" />
            <div className="taste__faces">
              {stats.voiceActors.map((bucket) => (
                <Link
                  key={bucket.voiceActor.id}
                  className="taste__face"
                  to={staffPath(bucket.voiceActor.id, bucket.voiceActor.name.full)}
                >
                  <img src={bucket.voiceActor.image?.large ?? ''} alt="" loading="lazy" />
                  <span>{bucket.voiceActor.name.full}</span>
                  <em>{bucket.count} roles</em>
                </Link>
              ))}
            </div>

            <SectionHeading title="Themes" detail="tags you watch most" />
            <div className="taste__tags">
              {stats.tags.map((bucket) => (
                <span key={bucket.tag.id} className="taste__tag">
                  {bucket.tag.name}
                  <b>{bucket.count}</b>
                </span>
              ))}
            </div>
          </section>
        </div>

        <SectionHeading title="What you watched, by release year" />
        <YearHistogram years={stats.releaseYears} />

        <SectionHeading title="Formats" />
        <div className="taste__formats">
          {formats.map((bucket) => (
            <div key={bucket.format} className="taste__format">
              <b>{bucket.count.toLocaleString()}</b>
              <span>{formatLabel(bucket.format)}</span>
              <em>{Math.round((bucket.count / formatTotal) * 100)}%</em>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

export default Taste;
