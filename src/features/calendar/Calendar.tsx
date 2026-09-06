import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import { motion } from 'framer-motion';

import './Calendar.css';

import CalendarSkeleton from './CalendarSkeleton';

import { AIRING_SCHEDULE_QUERY } from 'graphql/queries';
import { mediaPath } from 'helpers';
import { Airing, CalendarView } from './types';
import {
  addDays,
  addMonths,
  byDay,
  dayKey,
  monthGrid,
  rangeOf,
  sameDay,
  startOfMonth,
  startOfWeek,
  timeOf,
} from './dates';

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
/** Past this many in a month cell the rest collapse behind a count. */
const CELL_PREVIEW = 3;

function Calendar() {
  /**
   * Opens on the week, not the month.
   *
   * AniList publishes schedules about two weeks out, so a month grid is
   * genuinely half empty most of the time and reads as broken. The week is
   * always full, and "what is on Thursday" is the question people actually
   * arrive with.
   */
  const [view, setView] = useState<CalendarView>('week');
  // Read once: calling Date.now() during render is impure and the React
  // Compiler rejects it.
  const [today] = useState(() => new Date());
  const [anchor, setAnchor] = useState(() => new Date());

  const days = useMemo(
    () =>
      view === 'month'
        ? monthGrid(anchor)
        : Array.from({ length: 7 }, (_, index) => addDays(startOfWeek(anchor), index)),
    [view, anchor],
  );

  const { start, end } = useMemo(() => rangeOf(days), [days]);

  const { data, loading, error, fetchMore } = useQuery(AIRING_SCHEDULE_QUERY, {
    variables: { start, end, page: 1 },
  });

  const airings: Airing[] = data?.Page?.airingSchedules ?? [];
  const pageInfo = data?.Page?.pageInfo;

  /**
   * Keep paging until the window is covered.
   *
   * 50 is AniList's page maximum and a single busy day carries close to
   * thirty airings, so one page covers about a day and a half. Without this
   * the month view drew the first fifty airings and left three weeks blank,
   * which looks exactly like "nothing is on" rather than "not loaded yet".
   */
  useEffect(() => {
    if (!pageInfo?.hasNextPage) return;
    // A month is ~300 airings; the cap is a backstop against a runaway range.
    if (pageInfo.currentPage >= 8) return;
    fetchMore({
      variables: { start, end, page: pageInfo.currentPage + 1 },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult?.Page) return prev;
        return {
          Page: {
            ...fetchMoreResult.Page,
            airingSchedules: [
              ...(prev.Page?.airingSchedules ?? []),
              ...fetchMoreResult.Page.airingSchedules,
            ],
          },
        };
      },
    }).catch(() => {
      // A dropped page leaves the window partly filled rather than empty.
    });
  }, [pageInfo, fetchMore, start, end]);
  const buckets = useMemo(() => byDay(airings), [airings]);

  const step = (direction: number) =>
    setAnchor((current) =>
      view === 'month' ? addMonths(current, direction) : addDays(current, direction * 7),
    );

  const label =
    view === 'month'
      ? anchor.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })
      : `${days[0].toLocaleDateString(undefined, { day: 'numeric', month: 'short' })} – ${days[6].toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}`;

  const chip = (airing: Airing, compact: boolean) => (
    <Link
      key={airing.id}
      className={`calendar__chip${compact ? ' calendar__chip--compact' : ''}`}
      to={mediaPath(airing.media.id, airing.media.title.userPreferred)}
      title={`${airing.media.title.userPreferred} · episode ${airing.episode}`}
    >
      <img
        src={compact ? airing.media.coverImage.medium : airing.media.coverImage.large}
        alt=""
        loading="lazy"
      />
      <span className="calendar__chipBody">
        <b>{timeOf(airing.airingAt)}</b>
        <span className="calendar__chipTitle">{airing.media.title.userPreferred}</span>
        {!compact && <em>Episode {airing.episode}</em>}
      </span>
    </Link>
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="calendar"
    >
      <div className="calendar__bar">
        <div className="calendar__when">
          <button
            type="button"
            className="calendar__arrow"
            onClick={() => step(-1)}
            aria-label="Previous"
          >
            ‹
          </button>
          <h2>{label}</h2>
          <button
            type="button"
            className="calendar__arrow"
            onClick={() => step(1)}
            aria-label="Next"
          >
            ›
          </button>
          <button type="button" className="calendar__today" onClick={() => setAnchor(new Date())}>
            Today
          </button>
        </div>

        <div className="calendar__views" role="tablist" aria-label="Calendar view">
          {(['week', 'month', 'agenda'] as CalendarView[]).map((option) => (
            <button
              key={option}
              type="button"
              role="tab"
              aria-selected={view === option}
              className={`calendar__view${view === option ? ' is-active' : ''}`}
              onClick={() => setView(option)}
            >
              {option[0].toUpperCase() + option.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {loading && !airings.length ? (
        <CalendarSkeleton view={view} />
      ) : error ? (
        <p className="calendar__empty">We could not load the schedule.</p>
      ) : view === 'agenda' ? (
        <div className="calendar__agenda">
          {days
            .filter((day) => (buckets.get(dayKey(day)) ?? []).length)
            .map((day) => (
              <section key={dayKey(day)}>
                <h3 className={sameDay(day, today) ? 'is-today' : undefined}>
                  {day.toLocaleDateString(undefined, {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                  })}
                </h3>
                <div className="calendar__agendaList">
                  {(buckets.get(dayKey(day)) ?? []).map((airing) => chip(airing, false))}
                </div>
              </section>
            ))}
          {!airings.length && <p className="calendar__empty">Nothing airing in this window.</p>}
        </div>
      ) : (
        <>
          <div className="calendar__weekdays">
            {WEEKDAYS.map((weekday) => (
              <span key={weekday}>{weekday}</span>
            ))}
          </div>
          <div className={`calendar__grid calendar__grid--${view}`}>
            {days.map((day) => {
              const items = buckets.get(dayKey(day)) ?? [];
              const shown = view === 'month' ? items.slice(0, CELL_PREVIEW) : items;
              const hidden = items.length - shown.length;
              const outside =
                view === 'month' && day.getMonth() !== startOfMonth(anchor).getMonth();

              return (
                <div
                  key={dayKey(day)}
                  className={`calendar__cell${sameDay(day, today) ? ' is-today' : ''}${
                    outside ? ' is-outside' : ''
                  }`}
                >
                  <span className="calendar__date">{day.getDate()}</span>
                  {shown.map((airing) => chip(airing, view === 'month'))}
                  {hidden > 0 && (
                    <button
                      type="button"
                      className="calendar__more"
                      onClick={() => {
                        setAnchor(day);
                        setView('agenda');
                      }}
                    >
                      +{hidden} more
                    </button>
                  )}
                  {/* An empty Tuesday is information too, so the cell stays. */}
                  {!items.length && <span className="calendar__none">—</span>}
                </div>
              );
            })}
          </div>
        </>
      )}
    </motion.div>
  );
}

export default Calendar;
