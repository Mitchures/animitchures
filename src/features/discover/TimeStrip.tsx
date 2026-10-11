import { useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import './TimeStrip.css';

import DotNumber from 'components/DotNumber';
import { prefersReducedMotion } from 'components/useSettle';
import {
  Strip,
  StripPoint,
  displayTitle,
  compactCount,
  stripColumns,
  stripDay,
} from 'features/discover/derive';
import { mediaPath } from 'helpers';

/** Dot diameters by tier. A premiere is a ring, so it has a floor. */
const SIZES = [11, 7, 4.5];
const RING_MIN = 7;
/** Gap between two stacked dots, on top of their radii. */
const STACK_GAP = 4;
/** Columns closer than this are the same column for collision purposes. */
const SAME_COLUMN_PX = 8;
/** The band's inset from the board's top and bottom. */
const BAND_TOP = 50;
const BAND_BOTTOM = 44;
/** Horizontal breathing room inside the plot. */
const PAD = 22;
const DAY = 86400;
const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];
const SHORT = MONTHS.map((month) => month.slice(0, 3));

const sizeOf = (point: StripPoint) =>
  point.premiere ? Math.max(SIZES[point.rank], RING_MIN) : SIZES[point.rank];

const dayLabel = (seconds: number) => {
  const date = new Date(seconds * 1000);
  return `${SHORT[date.getMonth()]} ${date.getDate()}`;
};

const timeLabel = (seconds: number) => {
  const date = new Date(seconds * 1000);
  const hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours % 12 === 0 ? 12 : hours % 12}:${minutes}${hours < 12 ? 'am' : 'pm'}`;
};

const detailOf = (point: StripPoint) => {
  const { episode } = point.media.nextAiringEpisode;
  const total = point.media.episodes;
  const when = `${dayLabel(point.media.nextAiringEpisode.airingAt)} at ${timeLabel(
    point.media.nextAiringEpisode.airingAt,
  )}`;
  if (point.premiere) return `premieres ${when}`;
  return `episode ${episode}${total ? ` of ${total}` : ''}, ${when}`;
};

interface Placed {
  point: StripPoint;
  x: number;
  y: number;
  radius: number;
}

/**
 * Lays the points out, then pushes same-day dots apart so none is hidden.
 *
 * Two things make the collision pass necessary. The vertical axis does not
 * separate them on its own — two episodes air at exactly 22:30 with 30,550 and
 * 38,390 waiting, which is 2.4px apart on a 90px band. And the horizontal axis
 * cannot help either: at 32px a day an hour is 1.3px, so time of day is not
 * expressible and every episode on a day lands in the same place. So x snaps to
 * the day and the column is spread vertically, which costs nothing the axis
 * could have said and makes a packed day read as a column filling the band.
 */
const place = (strip: Strip, width: number, height: number): Placed[] => {
  const bandTop = BAND_TOP;
  const bandHeight = Math.max(1, height - BAND_TOP - BAND_BOTTOM);
  const span = Math.max(1, strip.end - strip.start);
  const xOf = (seconds: number) => PAD + ((seconds - strip.start) / span) * (width - PAD * 2);

  const placed: Placed[] = strip.points
    .map((point) => ({
      point,
      x: xOf(stripDay(point) + DAY / 2),
      y: bandTop + (1 - point.height) * bandHeight,
      radius: sizeOf(point) / 2,
    }))
    .sort((a, b) => a.x - b.x || a.y - b.y);

  let column: Placed[] = [];
  const settle = () => {
    if (column.length > 1) {
      column.sort((a, b) => a.y - b.y);
      for (let i = 1; i < column.length; i += 1) {
        const need = column[i - 1].radius + column[i].radius + STACK_GAP;
        if (column[i].y - column[i - 1].y < need) column[i].y = column[i - 1].y + need;
      }
      const top = column[0].y;
      const reach = column[column.length - 1].y - top;
      if (reach > bandHeight) {
        // More than the band can hold at full spacing: share the shortfall out
        // rather than letting the tail fall off the card.
        column.forEach((entry) => {
          entry.y = bandTop + ((entry.y - top) / reach) * bandHeight;
        });
      } else {
        const over = column[column.length - 1].y - (bandTop + bandHeight);
        const under = bandTop - top;
        const shift = over > 0 ? -over : under > 0 ? under : 0;
        column.forEach((entry) => {
          entry.y += shift;
        });
      }
    }
    column = [];
  };
  placed.forEach((entry) => {
    if (column.length && Math.abs(entry.x - column[0].x) > SAME_COLUMN_PX) settle();
    column.push(entry);
  });
  settle();

  return [
    ...placed,
    ...strip.offScale.map((point) => ({
      point,
      x: xOf(stripDay(point) + DAY / 2),
      y: bandTop,
      radius: 1,
    })),
  ];
};

/**
 * Discover's opening strip: five weeks of upcoming episodes, placed by air date
 * and by how many people are waiting.
 *
 * **A filled speck is a continuing episode and a ring is a premiere**, and that
 * one distinction carries the page's opening statement for free: a season hands
 * over mid-strip, so it reads left to right as a field of specks turning into a
 * row of rings. The alternative — marking week boundaries — was furniture
 * dressed up as structure.
 *
 * **Hovering snaps a glass puck to the nearest day** rather than to a dot. The
 * unit of the answer is then unambiguous, a day with seven episodes is as easy
 * to point at as a lone one, and the gesture is the one `PillNav`'s indicator
 * already uses, so the strip behaves like part of the app rather than a chart.
 */
function TimeStrip({ strip, now }: { strip: Strip; now: Date }) {
  const navigate = useNavigate();
  const plotRef = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState({ width: 0, height: 0 });
  const [at, setAt] = useState<number | null>(null);

  // The layout is measured, so it has to be recomputed when the box changes.
  useLayoutEffect(() => {
    const element = plotRef.current;
    if (!element) return;
    const read = () => setBox({ width: element.clientWidth, height: element.clientHeight });
    read();
    const observer = new ResizeObserver(read);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const placed = useMemo(
    () => (box.width ? place(strip, box.width, box.height) : []),
    [strip, box.width, box.height],
  );
  const columns = useMemo(() => stripColumns(strip), [strip]);
  /** Where each column sits, so the puck can fly to it. */
  const columnAt = useMemo(
    () =>
      columns.map((column) => {
        const members = placed.filter((entry) => stripDay(entry.point) === column.day);
        const x = members.length
          ? members.reduce((total, entry) => total + entry.x, 0) / members.length
          : 0;
        return { column, x, members };
      }),
    [columns, placed],
  );

  const snapTo = useCallback(
    (x: number) => {
      if (!columnAt.length) return;
      let best = 0;
      columnAt.forEach((entry, index) => {
        if (Math.abs(entry.x - x) < Math.abs(columnAt[best].x - x)) best = index;
      });
      setAt(best);
    },
    [columnAt],
  );

  const onMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    snapTo(event.clientX - rect.left);
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' && at !== null) {
      const lead = columnAt[at].column.points[0];
      if (lead) navigate(mediaPath(lead.media.id, lead.media.title.userPreferred));
      return;
    }
    const step = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0;
    if (!step) return;
    event.preventDefault();
    setAt((current) =>
      Math.max(0, Math.min(columnAt.length - 1, (current === null ? -1 : current) + step)),
    );
  };

  const active = at === null ? null : columnAt[at];
  const lead = active?.column.points[0] ?? null;
  const litIds = new Set(active?.column.points.map((point) => point.media.id) ?? []);
  const reduced = prefersReducedMotion();

  const nowX = box.width
    ? PAD +
      ((Math.floor(now.getTime() / 1000) - strip.start) / Math.max(1, strip.end - strip.start)) *
        (box.width - PAD * 2)
    : 0;

  /** Month names where a month turns, days every five, and never both. */
  const ticks = useMemo(() => {
    if (!box.width) return [];
    const span = Math.max(1, strip.end - strip.start);
    const xOf = (seconds: number) => PAD + ((seconds - strip.start) / span) * (box.width - PAD * 2);
    const midnight = new Date(strip.start * 1000);
    midnight.setHours(0, 0, 0, 0);
    const first = midnight.getTime() / 1000;
    const total = Math.round(span / DAY);
    const monthDays: number[] = [];
    for (let day = 0; day <= total; day += 1) {
      if (new Date((first + day * DAY) * 1000).getDate() === 1) monthDays.push(day);
    }
    const out = [{ x: xOf(strip.start), text: dayLabel(strip.start), month: false }];
    monthDays.forEach((day) =>
      out.push({
        x: xOf(first + day * DAY),
        text: MONTHS[new Date((first + day * DAY) * 1000).getMonth()],
        month: true,
      }),
    );
    for (let day = 5; day <= total; day += 5) {
      // A month name owns its neighbourhood, or "Sep 30" lands on "October".
      if (monthDays.some((month) => Math.abs(month - day) < 3)) continue;
      out.push({ x: xOf(first + day * DAY + DAY / 2), text: dayLabel(first + day * DAY), month: false });
    }
    return out;
  }, [strip.start, strip.end, box.width]);

  return (
    <div className={`timeStrip${active ? ' is-reading' : ''}`}>

      <p className="timeStrip__callout">
        <span
          className={`timeStrip__swatch${lead?.premiere ? ' is-ring' : ''}`}
          style={{ '--c': lead?.media.coverImage.color ?? 'var(--muted)' } as React.CSSProperties}
          aria-hidden="true"
        />
        <span className="timeStrip__read">
          <span className="timeStrip__title">
            {lead ? displayTitle(lead.media) : `${strip.continuing} continuing, ${strip.premieres} premiering`}
          </span>
          <span className="timeStrip__detail">
            {active && active.column.points.length > 1
              ? `${active.column.points.length} episodes on ${dayLabel(
                  active.column.day,
                )} — most awaited first`
              : lead
                ? detailOf(lead)
                : 'the next five weeks, by how many people are waiting'}
          </span>
        </span>
        <DotNumber
          className="timeStrip__figure"
          value={lead ? compactCount(lead.media.popularity ?? 0) : strip.points.length + strip.offScale.length}
          size="sm"
          arrive="none"
        />
      </p>

      <div className="timeStrip__board">
        <div
          className="timeStrip__plot"
          ref={plotRef}
          role="group"
          aria-label="Upcoming episodes by air date and how many people are waiting"
          tabIndex={0}
          onPointerMove={onMove}
          onPointerLeave={() => setAt(null)}
          onBlur={() => setAt(null)}
          onKeyDown={onKeyDown}
        >
          <span className="timeStrip__name">Next {Math.round((strip.end - strip.start) / DAY)} days</span>
          <span className="timeStrip__chip">
            <DotNumber value={strip.points.length + strip.offScale.length} size="sm" arrive="none" />
            <small>episodes</small>
            {strip.beyond > 0 && (
              <>
                <DotNumber value={strip.beyond} size="sm" arrive="none" />
                <small>later</small>
              </>
            )}
          </span>

          {placed.map(({ point, x, y }, index) =>
            strip.offScale.includes(point) ? (
              <span
                key={point.media.id}
                className="timeStrip__offScale"
                style={{ left: `${x}px` }}
                aria-hidden="true"
              />
            ) : (
              <span
                key={point.media.id}
                className={[
                  'timeStrip__dot',
                  point.premiere ? 'is-premiere' : '',
                  point.rank === 1 ? 'is-mid' : point.rank === 2 ? 'is-quiet' : '',
                  litIds.has(point.media.id) ? 'is-lit' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                style={
                  {
                    left: `${x}px`,
                    top: `${y}px`,
                    '--size': `${sizeOf(point)}px`,
                    ...(point.rank === 0 && point.media.coverImage.color
                      ? { '--c': point.media.coverImage.color }
                      : {}),
                    // One orchestrated entrance in date order, not a per-dot effect.
                    ...(reduced ? {} : { '--delay': `${index * 24}ms` }),
                  } as React.CSSProperties
                }
                aria-hidden="true"
              />
            ),
          )}

          <span className="timeStrip__now" style={{ left: `${nowX}px` }} aria-hidden="true" />
          {ticks.map((tick) => (
            <span
              key={`${tick.text}-${Math.round(tick.x)}`}
              className={`timeStrip__tick${tick.month ? ' is-month' : ''}`}
              style={{ left: `${tick.x}px` }}
              aria-hidden="true"
            >
              {tick.text}
            </span>
          ))}

          {active && (
            <span
              className="timeStrip__puck"
              style={
                {
                  left: `${active.x}px`,
                  '--w': `${Math.max(40, 26 + active.column.points.length * 5)}px`,
                } as React.CSSProperties
              }
              aria-hidden="true"
            >
              <b>{dayLabel(active.column.day)}</b>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default TimeStrip;
