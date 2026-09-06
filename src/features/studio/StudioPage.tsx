import { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import { motion } from 'framer-motion';

import './StudioPage.css';

import EntityHero from 'components/EntityHero';
import SectionHeading from 'components/SectionHeading';
import StudioSkeleton from './StudioSkeleton';

import { STUDIO_QUERY } from 'graphql/queries';
import { mediaPath } from 'helpers';
import { StudioEntity } from 'features/people/types';

type Work = StudioEntity['media']['nodes'][number];

function StudioPage() {
  const { id } = useParams();
  const { data, loading, error } = useQuery(STUDIO_QUERY, {
    variables: { id: Number(id), page: 1 },
    skip: !id,
  });

  const studio: StudioEntity | undefined = data?.Studio;

  /**
   * Grouped by year, newest first, with undated productions kept rather than
   * dropped — an announced-but-unscheduled show is a real thing a studio has,
   * and hiding it makes the filmography look shorter than it is.
   */
  const { dated, undated } = useMemo(() => {
    const groups = new Map<number, Work[]>();
    const noDate: Work[] = [];
    for (const work of studio?.media?.nodes ?? []) {
      if (!work.seasonYear) {
        noDate.push(work);
        continue;
      }
      const bucket = groups.get(work.seasonYear) ?? [];
      bucket.push(work);
      groups.set(work.seasonYear, bucket);
    }
    return {
      dated: [...groups.entries()].sort((a, b) => b[0] - a[0]),
      undated: noDate,
    };
  }, [studio]);

  if (loading && !studio) return <StudioSkeleton />;
  if (error || !studio) return <p className="studio__empty">We could not find that studio.</p>;

  const work = (item: Work) => (
    <Link
      key={item.id}
      className="studio__work"
      to={mediaPath(item.id, item.title.userPreferred)}
      title={item.title.userPreferred}
    >
      <img src={item.coverImage.large} alt="" loading="lazy" />
      <span className="studio__workTitle">{item.title.userPreferred}</span>
      <span className="studio__workMeta">
        {item.averageScore ?? '–'} · {item.episodes ?? '?'} ep
      </span>
    </Link>
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="studio"
    >
      <EntityHero
        tone="studio"
        name={studio.name}
        facts={[
          <>
            <b>{studio.favourites.toLocaleString()}</b> favourites
          </>,
          <>
            <b>{studio.media.nodes.length}</b> productions
          </>,
          <b key="kind">{studio.isAnimationStudio ? 'Animation studio' : 'Producer'}</b>,
        ]}
      />

      <div className="studio__body">
        <SectionHeading title="Filmography" detail="newest first" />

        {!!undated.length && (
          <div className="studio__year">
            <div className="studio__yearLabel studio__yearLabel--tba">
              <b>TBA</b>
              <i />
            </div>
            <div className="studio__works">{undated.map(work)}</div>
          </div>
        )}

        {dated.map(([year, items]) => (
          <div key={year} className="studio__year">
            <div className="studio__yearLabel">
              <b>{year}</b>
              <i />
            </div>
            <div className="studio__works">{items.map(work)}</div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

export default StudioPage;
