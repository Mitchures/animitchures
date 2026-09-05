import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import { motion, useMotionValue, useTransform, useReducedMotion } from 'framer-motion';

import './Details.css';

import Loader from 'components/Loader';
import Sidebar from 'components/details/Sidebar';
import Summary from 'components/details/Summary';
import Relations from 'components/details/Relations';
import Characters from 'components/details/Characters';
import Staff from 'components/details/Staff';
import Actions from 'components/details/Actions';
import HeroMeta from 'components/details/HeroMeta';
import DetailsTabs, { DetailsTab } from 'components/details/DetailsTabs';

import { useScrollContainer } from 'context';
import { Media } from 'graphql/types';
import { DETAILS_EXTENDED_QUERY } from 'graphql/queries';
import { authHeader } from 'helpers';

function Details() {
  const { id } = useParams<any>();
  const reduceMotion = useReducedMotion();
  const scrollContainerRef = useScrollContainer();
  // Read in an effect rather than via useScroll(): the window never scrolls
  // here, and a MotionValue keeps scroll updates out of React's render path.
  const scrollY = useMotionValue(0);

  // Banner drifts at ~35% of scroll speed while the hero moves against it and
  // fades out. Input ranges are px of scroll, matched to the 520px banner;
  // useTransform clamps, so a taller banner cannot push the translation past
  // the over-extension that hides the image's top edge.
  const bannerY = useTransform(scrollY, [0, 520], [0, 180]);
  const heroY = useTransform(scrollY, [0, 520], [0, -60]);
  const heroOpacity = useTransform(scrollY, [150, 380], [1, 0]);
  // The title reappears in the tab bar as the hero's copy leaves.
  const compactOpacity = useTransform(scrollY, [220, 360], [0, 1]);
  const [selected, setSelected] = useState<Media | null>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const { loading, data } = useQuery(DETAILS_EXTENDED_QUERY, {
    variables: {
      id,
      type: 'ANIME',
    },
    context: {
      headers: authHeader(),
    },
  });

  // Tilts the poster toward the pointer. Read from the wrapper's box so the
  // rotation itself cannot feed back into the measurement.
  const handlePosterMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (reduceMotion) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const px = (event.clientX - bounds.left) / bounds.width - 0.5;
    const py = (event.clientY - bounds.top) / bounds.height - 0.5;
    setTilt({ x: -py * 14, y: px * 14 });
  };

  useEffect(() => {
    const element = scrollContainerRef?.current;
    if (!element) return;
    const update = () => scrollY.set(element.scrollTop);
    update();
    element.addEventListener('scroll', update, { passive: true });
    return () => element.removeEventListener('scroll', update);
  }, [scrollContainerRef, scrollY]);

  useEffect(() => {
    console.log(data);
    if (!loading && data) setSelected(data.Media);
    return () => setSelected(null);
  }, [data]);

  if (loading || !selected) return <Loader />;

  // The other titles this show goes by, minus whichever one is already the
  // heading. Deduped because romaji and userPreferred are frequently identical.
  const altTitles = [
    ...new Set(
      [selected.title?.romaji, selected.title?.english, selected.title?.native].filter(
        (title): title is string => Boolean(title) && title !== selected.title?.userPreferred,
      ),
    ),
  ];

  // Relations renders anime only, so the tab has to be gated on the same filter:
  // a title whose relations are all manga has edges but nothing to show, and
  // would otherwise open an empty tab.
  const animeRelations =
    selected.relations?.edges?.filter((edge) => edge?.node?.type === 'ANIME') ?? [];

  const tabs = [
    {
      id: 'overview',
      label: 'Overview',
      content: (
        <div className="details__overview">
          <div className="details__overviewMain">
            <Summary {...selected} />
            {selected.trailer && (
              <>
                <h3>Trailer</h3>
                <div className="details__iframeWrapper">
                  <iframe
                    src={`https://www.youtube.com/embed/${selected.trailer.id}`}
                    allow="autoplay; encrypted-media"
                    allowFullScreen
                    title="video"
                    className="details__iframe"
                  />
                </div>
              </>
            )}
          </div>
          <Sidebar {...selected} />
        </div>
      ),
    },
    selected.characters?.edges?.length && {
      id: 'characters',
      label: 'Characters',
      content: <Characters {...selected} />,
    },
    selected.staff?.edges?.length && {
      id: 'staff',
      label: 'Staff',
      content: <Staff {...selected} />,
    },
    animeRelations.length > 0 && {
      id: 'relations',
      label: 'Relations',
      content: <Relations {...selected} />,
    },
  ].filter(Boolean) as DetailsTab[];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="details"
    >
      <div className="details__banner">
        {/* The image is its own layer so it can translate independently of the
            scrim and the content sitting on top of it. */}
        <motion.div
          className="details__bannerImage"
          style={{
            backgroundImage: `url(${
              selected.bannerImage ? selected.bannerImage : selected.coverImage?.extraLarge
            })`,
            y: reduceMotion ? undefined : bannerY,
          }}
        />
        <div className="details__bannerScrim"></div>
        <motion.div
          className="details__hero"
          style={{
            y: reduceMotion ? undefined : heroY,
            opacity: reduceMotion ? undefined : heroOpacity,
          }}
        >
          <div
            className="details__posterWrap"
            onMouseMove={handlePosterMove}
            onMouseLeave={() => setTilt({ x: 0, y: 0 })}
          >
            <motion.img
              className="details__poster"
              animate={{ rotateX: tilt.x, rotateY: tilt.y }}
              transition={{ type: 'spring', stiffness: 220, damping: 18 }}
              src={selected.coverImage?.extraLarge || ''}
              alt={selected.title?.userPreferred || 'No Image'}
            />
          </div>
          <div className="details__heroBody">
            <h1 className="details__title">{selected.title?.userPreferred}</h1>
            {altTitles.length > 0 && <p className="details__altTitles">{altTitles.join(' · ')}</p>}
            {selected.genres && selected.genres.length > 0 && (
              <motion.div
                className="details__tags"
                initial="hidden"
                animate="shown"
                variants={{
                  shown: { transition: { staggerChildren: reduceMotion ? 0 : 0.04 } },
                }}
              >
                {selected.genres.map((genre) => (
                  <motion.span
                    key={`${genre}`}
                    className="details__tag"
                    variants={{
                      hidden: { opacity: 0, y: reduceMotion ? 0 : 8 },
                      shown: { opacity: 1, y: 0 },
                    }}
                  >
                    {genre}
                  </motion.span>
                ))}
              </motion.div>
            )}
            <HeroMeta media={selected} />
          </div>
          <Actions media={selected} />
        </motion.div>
      </div>
      <DetailsTabs
        tabs={tabs}
        trailing={
          // aria-hidden: it repeats the <h1> already in the hero, and announcing
          // the same title twice helps nobody.
          <motion.span
            className="detailsTabs__title"
            style={{ opacity: reduceMotion ? 1 : compactOpacity }}
            aria-hidden="true"
          >
            {selected.title?.userPreferred}
          </motion.span>
        }
      />
    </motion.div>
  );
}

export default Details;
