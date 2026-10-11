import { CSSProperties, useEffect, useMemo, useState } from 'react';
import { useQuery } from '@apollo/client';
import { motion } from 'framer-motion';

import './Discover.css';

import DotNumber from 'components/DotNumber';
import StatRow from 'components/StatRow';
import InfoCard from 'components/InfoCard';
import LinkTile from 'components/LinkTile';
import SectionHeading from 'components/SectionHeading';
import Button from 'components/Button';
import EpisodeCard from 'components/EpisodeCard';
import TileDeck, { DeckSlide } from 'components/TileDeck';
import NextEpisodeTile from 'features/discover/NextEpisodeTile';
import EpisodeRow from 'components/EpisodeRow';
import PosterEchoCard from 'components/PosterEchoCard';
import ComingLater from 'features/discover/ComingLater';
import GenreTiles from 'features/discover/GenreTiles';
import PopularList from 'features/discover/PopularList';
import SeasonWeeks from 'features/discover/SeasonWeeks';
import SlideHero from 'features/discover/SlideHero';
import TimeStrip from 'features/discover/TimeStrip';
import { useFitCount } from 'features/discover/useFitCount';
import DayPills from 'features/discover/DayPills';
import DiscoverSkeleton from 'features/discover/DiscoverSkeleton';
import {
  airingWithin,
  airingTonight,
  topRated,
  seasonCountdown,
  weekDots,
  whenLabel,
  genreCounts,
  seasonWeeks,
  stripModel,
  nextEpisode,
  comingLater,
  allTimePopular,
  busiestDay,
  weekRuntime,
  bestScored,
  mostAwaited,
  compactCount,
  scoreShare,
  longestRunning,
  formatMix,
  formatWord,
  displayTitle,
} from 'features/discover/derive';

import { FEATURED_QUERY } from 'graphql/queries';
import { featuredVariables } from 'graphql/featured';
import { useStateValue } from 'context';
import { PALETTES } from 'helpers';

const WEEK = 7 * 86400;
/** How long a season's lead-in runs, for the countdown's progress line. */
const SEASON_LEAD_DAYS = 90;
const SEASON_LABEL: Record<string, string> = {
  WINTER: 'Winter',
  SPRING: 'Spring',
  SUMMER: 'Summer',
  FALL: 'Fall',
};
const TONIGHT_DOTS = 14;
/** Top rated is a fixed four: the cards scale with the width rather than adding a fifth. */
const TOP_RATED = 4;

/** The entrance stagger index, as a custom property the CSS reads. */
/** See the TODO at the strip's render site. */
const SHOW_TIME_STRIP = false;

const rise = (index: number) => ({ '--i': Math.min(index, 7) }) as CSSProperties;

/**
 * Discover, as the A1 dashboard: how much is airing, when, and what to watch
 * first, with the trending slider kept because the art is the product.
 *
 * Every figure comes from the one Featured query already in flight — nothing
 * here costs a second request, which the 30-a-minute rate limit requires — and
 * every derivation lives in ./derive so the numbers can be tested.
 */
function Discover() {
  const [{ featured, user, anilist_user, favorites }, dispatch] = useStateValue();

  // The same call AuthShell makes, so the wall of cover art behind the login
  // card warms this query's cache entry instead of fetching its own copy.
  const { data } = useQuery(FEATURED_QUERY, {
    variables: featuredVariables(user?.isAdult || false),
  });

  useEffect(() => {
    if (data) dispatch({ type: 'set_featured', featured: data });
  }, [data]);

  // A minute is enough: the page prints days, hours and air times, not seconds.
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(timer);
  }, []);
  const nowSeconds = Math.floor(now.getTime() / 1000);

  // The week row fills the width of the screen with as many cards as fit, four
  // at the old 1180px and up to six on a wide display; the minimum is the width
  // the card was designed at. Top rated is a fixed four — see TOP_RATED.
  const [weekRef, weekCols] = useFitCount(250, 14, 4, 6);

  const model = useMemo(() => {
    if (!featured) return null;
    const week = airingWithin(featured, nowSeconds, WEEK);
    const tonight = airingTonight(featured, now);
    const top = topRated(featured);
    const season = seasonCountdown(featured, nowSeconds);
    const vars = featuredVariables(user?.isAdult || false, now);
    return {
      week,
      tonight,
      top,
      season,
      seasonName: `${SEASON_LABEL[vars.season]} ${vars.seasonYear}`,
      nextSeasonName: `${SEASON_LABEL[vars.nextSeason]} ${vars.nextYear}`,
      days: weekDots(week, nowSeconds),
      trending: featured.trending?.media.slice(0, 5) ?? [],
      topList: featured.top?.media ?? [],
      // Twelve, not the default eight: GenreTiles shows two rows of as many as fit.
      genres: genreCounts(featured, 12),
      weeks: seasonWeeks(featured, nowSeconds),
      timeStrip: stripModel(featured, nowSeconds),
      next: nextEpisode(featured, favorites ?? [], nowSeconds),
      later: comingLater(featured),
      popular: allTimePopular(featured),
      busiest: busiestDay(week),
      runtime: weekRuntime(week),
      bestWeek: bestScored(week),
      // By popularity, not by score: tonight's best-scored title is usually also
      // its first episode, and two slides naming the same show say one thing.
      awaitedTonight: mostAwaited(tonight.filter((media) => media.id !== tonight[0]?.id)),
      scores: scoreShare(featured),
      longest: longestRunning(featured),
      formats: formatMix(featured),
    };
    // `now` is derived from nowSeconds, which is in the list.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [featured, nowSeconds, favorites, user?.isAdult]);

  if (!model) return <DiscoverSkeleton />;
  const {
    week,
    tonight,
    top,
    season,
    seasonName,
    nextSeasonName,
    days,
    trending,
    topList,
    genres,
    weeks,
    timeStrip,
    next,
    later,
    popular,
    busiest,
    runtime,
    bestWeek,
    awaitedTonight,
    scores,
    longest,
    formats,
  } = model;

  const stats = [
    { value: week.length, label: 'Airing this week', tone: 'lime' as const },
    { value: tonight.length, label: 'Tonight' },
    ...(user ? [{ value: favorites?.length ?? 0, label: 'Favorites' }] : []),
    ...(top?.averageScore ? [{ value: top.averageScore, label: 'Top score' }] : []),
  ];

  const tonightFirst = tonight[0];
  // "Tonight, 11:00 pm" → "11:00 pm": the tile's label already says Tonight.
  const tonightFrom = tonightFirst
    ? whenLabel(tonightFirst.nextAiringEpisode.airingAt, now).replace('Tonight, ', '')
    : '';
  const seasonProgress = season
    ? Math.max(0, 1 - Math.min(season.days, SEASON_LEAD_DAYS) / SEASON_LEAD_DAYS)
    : 0;

  const seasonTitleCount =
    weeks.weeks.reduce((total, entry) => total + entry.premieres.length, 0) + weeks.undated.length;

  // LinkTile only has something to offer a signed-in account that has not
  // linked yet. Signed out there is nothing to link, so the ring takes the slot.
  const showLinkTile = Boolean(user) && !anilist_user;

  /* The three widget decks — one time horizon each, `filter(Boolean)` so a
     slide whose figure is not there simply does not exist rather than printing
     a zero. A deck left with one slide stops cycling and drops its pager. */
  const tonightDeck: DeckSlide[] = [
    {
      label: 'Tonight',
      value: tonight.length,
      caption: tonight.length ? 'episodes before midnight' : 'nothing else airs tonight',
    },
    ...(tonightFirst
      ? [
          {
            label: 'First up tonight',
            // The hour as the figure and the meridiem as a word: Doto draws a
            // colon as two stacked dots, which at this weight reads as ÷.
            value: tonightFrom.replace(/:00 | /g, ' ').split(' ')[0],
            unit: tonightFrom.includes('pm') ? 'pm' : 'am',
            caption: displayTitle(tonightFirst),
          },
        ]
      : []),
    ...(awaitedTonight?.popularity
      ? [
          {
            label: 'Also awaited tonight',
            value: compactCount(awaitedTonight.popularity),
            caption: displayTitle(awaitedTonight),
          },
        ]
      : []),
  ];

  const weekDeck: DeckSlide[] = [
    ...(busiest
      ? [
          {
            label: 'Busiest day',
            value: busiest.count,
            caption: [
              busiest.count === 1
                ? `episode lands on ${busiest.day}`
                : `episodes land on ${busiest.day}`,
              // The share is only worth saying when there is a week to be a
              // share of: one episode on one day is trivially 100 per cent.
              week.length >= 4 && busiest.share >= 0.4 ? 'nearly half the week' : null,
            ]
              .filter(Boolean)
              .join(' — '),
          },
        ]
      : []),
    ...(runtime
      ? [
          {
            label: 'Time to watch',
            value: runtime.hours,
            caption: `hours across ${runtime.episodes} episode${runtime.episodes === 1 ? '' : 's'}`,
          },
        ]
      : []),
    ...(bestWeek?.averageScore
      ? [
          {
            label: 'Best of the week',
            value: bestWeek.averageScore,
            caption: `${displayTitle(bestWeek)}, ${
              whenLabel(bestWeek.nextAiringEpisode.airingAt, now).split(',')[0]
            }`,
          },
        ]
      : []),
    // Every week slide needs something airing. With nothing, say so once.
    ...(week.length ? [] : [{ label: 'This week', value: 0, caption: 'nothing airing yet' }]),
  ];

  const momentDeck: DeckSlide[] = [
    ...(scores
      ? [
          {
            label: `Scoring ${scores.threshold} or better`,
            value: scores.count,
            caption: `of the ${scores.of} scored titles on this page`,
          },
        ]
      : []),
    ...(longest?.episodes
      ? [
          {
            label: 'Longest running',
            value: longest.episodes,
            caption: `episodes of ${displayTitle(longest)}`,
          },
        ]
      : []),
    ...(formats
      ? [
          {
            label: 'Series to films',
            value: formats.lead.count,
            caption: [
              formatWord(formats.lead.format, formats.lead.count),
              ...formats.rest
                .slice(0, 3)
                .map((entry) => `${entry.count} ${formatWord(entry.format, entry.count)}`),
            ].join(', '),
          },
        ]
      : []),
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="discover"
    >
      {/* No greeting. The stat row opens the page: it is the first thing that
          says something, and a welcome line said nothing twice a day. */}
      <div className="discover__rise" style={rise(0)}>
        <StatRow stats={stats} />
      </div>

      {/* TODO(2026-10-11): the time strip is hidden, not removed. It needs a
          refinement pass before it goes back — Mitchell parked it while the
          rest of the home page was being reworked. Flip SHOW_TIME_STRIP to
          bring it back; `stripModel` and its tests are untouched. */}
      {SHOW_TIME_STRIP && (
        <div className="discover__desktopOnly discover__rise" style={rise(2)}>
          <TimeStrip strip={timeStrip} now={now} />
        </div>
      )}
      <div className="discover__phoneOnly discover__rise" style={rise(2)}>
        <DayPills days={days} />
        {week[0] && <EpisodeRow media={week[0]} eyebrow="Airing next" now={now} />}
      </div>

      <div className="discover__grid">
        <div className="discover__main">
          <div className="discover__rise" style={rise(3)}>
            <SlideHero media={trending} />
          </div>
          <div className="discover__widgets">
            <TileDeck
              slides={tonightDeck}
              treatment="band"
              palette={PALETTES.score}
              to="/calendar"
              order={0}
              className="discover__rise"
              style={rise(4)}
              footer={Array.from({ length: TONIGHT_DOTS }, (_, index) => (
                <i
                  key={index}
                  className={`frostedTile__dot${
                    index < tonight.length ? ' frostedTile__dot--on' : ''
                  }`}
                />
              ))}
            />

            <TileDeck
              slides={weekDeck}
              treatment="blob"
              palette={PALETTES.night}
              to="/calendar"
              order={1}
              className="discover__rise"
              style={rise(5)}
            />

            <TileDeck
              slides={momentDeck}
              treatment="core"
              palette={PALETTES.fall}
              to="/search/anime?sort=SCORE_DESC"
              order={2}
              className="discover__rise"
              style={rise(6)}
            />
          </div>
        </div>

        <aside className="discover__side discover__rise" style={rise(4)}>
          {/* One slot, two tenants. LinkTile when there is an account to link;
              the countdown ring whenever there is not — signed out, or signed
              in and already connected — which is what used to leave a 300px
              square of this column empty. */}
          {showLinkTile ? <LinkTile /> : next && <NextEpisodeTile next={next} now={now} />}
          {/* The card keeps the season and nothing else. It used to switch
              between the season and your next favourite episode, and with the
              ring above it counting down too that was the same fact twice. */}
          <InfoCard
            title={seasonName}
            value={<DotNumber value={season?.days ?? 0} size="md" />}
            unit="days"
            progress={seasonProgress}
            caption={
              season
                ? `${season.count} premieres. ${
                    season.first?.title.english ?? season.first?.title.userPreferred
                  } airs first.`
                : 'Schedule not announced yet.'
            }
          />
        </aside>
      </div>

      <SectionHeading
        title="Airing this week"
        detail="What’s on, in the order it airs."
        action={<Button to="/calendar">See all</Button>}
      />
      <div
        ref={weekRef}
        className="discover__cards discover__desktopOnly discover__rise"
        style={{ ...rise(7), '--cols': weekCols } as CSSProperties}
      >
        {week.slice(0, weekCols).map((media) => (
          <EpisodeCard key={media.id} media={media} now={now} />
        ))}
      </div>
      <div className="discover__list discover__phoneOnly discover__rise" style={rise(7)}>
        {week.slice(0, 3).map((media) => (
          <EpisodeRow key={media.id} media={media} now={now} />
        ))}
      </div>

      <SectionHeading
        title="Top rated"
        detail="The highest scores on AniList right now."
        action={<Button to="/search/anime?sort=SCORE_DESC">See all</Button>}
      />
      <div className="discover__cards discover__cards--top discover__rise" style={rise(7)}>
        {topList.slice(0, TOP_RATED).map((media, index) => (
          <PosterEchoCard key={media.id} media={media} rank={index + 1} />
        ))}
      </div>

      <SectionHeading
        title="Starting this season"
        detail={`${seasonName} · ${seasonTitleCount} titles, the first in ${season?.days ?? 0} days.`}
        action={<Button to="/calendar">See all</Button>}
      />
      <div className="discover__rise" style={rise(7)}>
        <SeasonWeeks weeks={weeks.weeks} undated={weeks.undated} />
      </div>

      <SectionHeading
        title="Browse by genre"
        detail="Where to start, and how much is there."
        action={<Button to="/search/anime">All genres</Button>}
      />
      <div className="discover__rise" style={rise(7)}>
        <GenreTiles genres={genres} />
      </div>

      {later.lead && (
        <>
          <SectionHeading
            title="Coming later"
            detail={`${nextSeasonName} · ${later.total} titles announced so far.`}
            action={<Button to="/search/anime?sort=POPULARITY_DESC">See all</Button>}
          />
          <div className="discover__rise" style={rise(7)}>
            <ComingLater {...later} />
          </div>
        </>
      )}

      {popular.length > 0 && (
        <>
          <SectionHeading
            title="All-time popular"
            detail="The most-listed anime on AniList, ever."
            action={<Button to="/search/anime?sort=POPULARITY_DESC">See all</Button>}
          />
          <div className="discover__rise" style={rise(7)}>
            <PopularList media={popular} />
          </div>
        </>
      )}
    </motion.div>
  );
}

export default Discover;
