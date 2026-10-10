import { Featured, FeaturedMedia } from 'graphql/featured';

/** A media item the filters below have already proven has an airing date. */
export type Airing = FeaturedMedia & {
  nextAiringEpisode: NonNullable<FeaturedMedia['nextAiringEpisode']>;
};

const DAY = 86400;
/** How long after air time an episode still counts as "on". */
const GRACE_SECONDS = 30 * 60;
const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/**
 * Every derived number on Discover, in one pure module.
 *
 * Extracted rather than computed inline so the figures the page prints can be
 * tested against the captured fixture — the dashboard's whole point is that its
 * counts are true, and a count that is quietly wrong looks exactly like one
 * that is right.
 */

/** Buckets overlap heavily — the same show is often trending *and* popular. */
export const uniqueMedia = (featured: Featured | null | undefined): FeaturedMedia[] => {
  const seen = new Map<number, FeaturedMedia>();
  Object.values(featured ?? {}).forEach((bucket) =>
    bucket?.media.forEach((media) => {
      if (!seen.has(media.id)) seen.set(media.id, media);
    }),
  );
  return [...seen.values()];
};

const isAiring = (media: FeaturedMedia): media is Airing =>
  Boolean(media.nextAiringEpisode?.airingAt);

/** What airs between now and `windowSeconds` from now, soonest first. */
export const airingWithin = (
  featured: Featured | null | undefined,
  nowSeconds: number,
  windowSeconds: number,
): Airing[] =>
  uniqueMedia(featured)
    .filter(isAiring)
    .filter(
      (media) =>
        media.nextAiringEpisode.airingAt >= nowSeconds - GRACE_SECONDS &&
        media.nextAiringEpisode.airingAt < nowSeconds + windowSeconds,
    )
    .sort((a, b) => a.nextAiringEpisode.airingAt - b.nextAiringEpisode.airingAt);

/** Tonight is what is left before the next local midnight, not the next 24 hours. */
export const airingTonight = (featured: Featured | null | undefined, now: Date): Airing[] => {
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0);
  const nowSeconds = Math.floor(now.getTime() / 1000);
  return airingWithin(featured, nowSeconds, Math.floor(midnight.getTime() / 1000) - nowSeconds);
};

export const topRated = (featured: Featured | null | undefined): FeaturedMedia | undefined =>
  featured?.top?.media[0];

/**
 * How long until the season's first premiere, and how many titles it holds.
 *
 * Episode 1 only: the season bucket also carries shows already part-way
 * through, and "premieres in" has to mean a premiere.
 */
export const seasonCountdown = (featured: Featured | null | undefined, nowSeconds: number) => {
  const season = featured?.season?.media ?? [];
  const upcoming = season
    .filter(isAiring)
    .filter(
      (media) =>
        media.nextAiringEpisode.episode === 1 && media.nextAiringEpisode.airingAt > nowSeconds,
    )
    .sort((a, b) => a.nextAiringEpisode.airingAt - b.nextAiringEpisode.airingAt);
  if (!upcoming.length) return null;
  return {
    days: Math.round((upcoming[0].nextAiringEpisode.airingAt - nowSeconds) / DAY),
    first: upcoming[0],
    count: season.length,
  };
};

/** The favourite worth putting on the page: highest scored of those still airing. */
/**
 * **Nothing renders this.** Discover's aside used to switch its card between
 * the season countdown and this, and on 2026-09-18 the countdown ring took over
 * the "what's next for you" job — soonest rather than highest-rated, because
 * the tile's claim is that the episode is next. Kept with its tests; delete it
 * if a profile or watchlist surface never wants it.
 */
export const highestRatedAiringFavorite = (
  featured: Featured | null | undefined,
  favorites: number[],
): Airing | undefined => {
  const set = new Set(favorites);
  return uniqueMedia(featured)
    .filter(isAiring)
    .filter((media) => set.has(media.id))
    .sort((a, b) => (b.averageScore ?? 0) - (a.averageScore ?? 0))[0];
};

export interface ComingLater {
  /** The most-anticipated of the bunch — it gets the card. */
  lead?: FeaturedMedia;
  rest: FeaturedMedia[];
  total: number;
}

/**
 * The titles announced for after this season, most-anticipated first.
 *
 * Ordered by how many people are waiting rather than by AniList's own order,
 * because the section's one job is to say what to look forward to. Sorted here
 * rather than in the component so the figure driving the layout is testable.
 */
export const comingLater = (featured: Featured | null | undefined, count = 3): ComingLater => {
  const media = [...(featured?.nextSeason?.media ?? [])].sort(
    (a, b) => (b.popularity ?? 0) - (a.popularity ?? 0),
  );
  const [lead, ...rest] = media;
  return { lead, rest: rest.slice(0, count), total: media.length };
};

/** The most-listed titles on AniList, already in order from the query. */
export const allTimePopular = (featured: Featured | null | undefined, count = 6): FeaturedMedia[] =>
  (featured?.popular?.media ?? []).slice(0, count);

/**
 * Which genres this response covers, most-represented first.
 *
 * Counted across every bucket rather than one, so the figure means "of the
 * titles on this page" — which is what the section is a way into. No extra
 * request: `genres` comes back on every media object already.
 */
export const genreCounts = (
  featured: Featured | null | undefined,
  limit = 8,
): { genre: string; count: number }[] => {
  const counts = new Map<string, number>();
  uniqueMedia(featured).forEach((media) =>
    (media.genres ?? []).forEach((genre) => counts.set(genre, (counts.get(genre) ?? 0) + 1)),
  );
  return (
    [...counts.entries()]
      .map(([genre, count]) => ({ genre, count }))
      // Alphabetical within a tie, so the row does not reshuffle between renders
      // when two genres sit on the same count — Action and Drama both hit 40.
      .sort((a, b) => b.count - a.count || a.genre.localeCompare(b.genre))
      .slice(0, limit)
  );
};

/**
 * Signed out there is nobody to greet, so the page is just named.
 *
 * **Nothing renders this.** The greeting heading came off Discover on
 * 2026-09-18 — the stat row opens the page instead. Kept, with its tests,
 * because a signed-in header or a profile page is the obvious next home for it;
 * delete it if that never arrives rather than wiring it back into Discover.
 */
export const greeting = (now: Date, name?: string | null): string => {
  if (!name) return 'Discover';
  const hour = now.getHours();
  const part = hour < 12 ? 'morning' : hour < 18 ? 'afternoon' : 'evening';
  return `Good ${part}, ${name}`;
};

/** Eight day columns from today; each episode is one dot in its title's cover colour. */
export const weekDots = (airing: Airing[], nowSeconds: number) => {
  const start = new Date(nowSeconds * 1000);
  start.setHours(0, 0, 0, 0);
  return Array.from({ length: 8 }, (_, index) => {
    const dayStart = start.getTime() / 1000 + index * DAY;
    const colors = airing
      .filter(
        (media) =>
          media.nextAiringEpisode.airingAt >= dayStart &&
          media.nextAiringEpisode.airingAt < dayStart + DAY,
      )
      .map((media) => media.coverImage.color ?? '#c9c9cd');
    return { label: DAY_LABELS[new Date(dayStart * 1000).getDay()], isToday: index === 0, colors };
  });
};

/**
 * A member count as people read it: 1.05M, 991K, 838K.
 *
 * Two decimals above a million, none below — 991K rather than 0.99M, because
 * the whole point of the figure is that these are the biggest lists on the site.
 */
export const compactCount = (value: number): string => {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(2)}M`;
  if (value >= 1_000) return `${Math.round(value / 1_000)}K`;
  return String(value);
};

/** The title to print: AniList leaves `english` null for plenty of entries. */
export const displayTitle = (media: FeaturedMedia): string =>
  media.title.english ?? media.title.userPreferred;

/** Monday 00:00 of the week containing `seconds`, in local time. */
const weekStart = (seconds: number): number => {
  const date = new Date(seconds * 1000);
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() - ((date.getDay() + 6) % 7));
  return date.getTime() / 1000;
};

export interface SeasonWeek {
  /** Monday 00:00, unix seconds — also the React key. */
  start: number;
  label: string;
  isCurrent: boolean;
  premieres: Airing[];
  /** Seven slots, Monday to Sunday. A slot holds the colours premiering that day. */
  days: string[][];
  /** One line: what leads the week, and when it runs. */
  lede: string;
}

/**
 * The season's premieres grouped into the week they land in, plus the titles
 * announced without a date.
 *
 * Weeks run Monday to Sunday, and **empty weeks in between are kept** — the gap
 * where nothing premieres is a real fact about the season's shape, and dropping
 * it would make a 28-day silence look like a week.
 */
export const seasonWeeks = (
  featured: Featured | null | undefined,
  nowSeconds: number,
): { weeks: SeasonWeek[]; undated: FeaturedMedia[] } => {
  const season = featured?.season?.media ?? [];
  const dated = season
    .filter(isAiring)
    .filter((media) => media.nextAiringEpisode.episode === 1)
    .sort((a, b) => a.nextAiringEpisode.airingAt - b.nextAiringEpisode.airingAt);
  const undated = season.filter(
    (media) => !(media.nextAiringEpisode && media.nextAiringEpisode.episode === 1),
  );
  if (!dated.length) return { weeks: [], undated };

  const grouped = new Map<number, Airing[]>();
  dated.forEach((media) => {
    const key = weekStart(media.nextAiringEpisode.airingAt);
    grouped.set(key, [...(grouped.get(key) ?? []), media]);
  });

  const thisWeek = weekStart(nowSeconds);
  // Anchored to the first premiere, not to today: between seasons that is three
  // weeks out, and starting from today would open the row with three empty cards.
  const first = Math.min(...grouped.keys());
  const last = Math.max(...grouped.keys());
  const weeks: SeasonWeek[] = [];

  for (let start = first; start <= last; start += 7 * DAY) {
    const premieres = grouped.get(start) ?? [];
    const days: string[][] = Array.from({ length: 7 }, () => []);
    premieres.forEach((media) => {
      const when = new Date(media.nextAiringEpisode.airingAt * 1000);
      days[(when.getDay() + 6) % 7].push(media.coverImage.color ?? '#c9c9cd');
    });
    weeks.push({
      start,
      label:
        start === thisWeek
          ? 'This week'
          : `Week of ${new Date(start * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`,
      isCurrent: start === thisWeek,
      premieres,
      days,
      lede: ledeFor(premieres),
    });
  }
  return { weeks, undated };
};

/** What the week's line says. Weekdays are computed, never assumed. */
const ledeFor = (premieres: Airing[]): string => {
  if (!premieres.length) return '';
  const day = (media: Airing) =>
    new Date(media.nextAiringEpisode.airingAt * 1000).toLocaleDateString('en-US', {
      weekday: 'long',
    });
  if (premieres.length === 1) return `${displayTitle(premieres[0])}, ${day(premieres[0])}`;
  const lead = [...premieres].sort((a, b) => (b.popularity ?? 0) - (a.popularity ?? 0))[0];
  const span =
    day(premieres[0]) === day(premieres[premieres.length - 1])
      ? day(premieres[0])
      : `${day(premieres[0])} to ${day(premieres[premieres.length - 1])}`;
  return `${displayTitle(lead)} leads, ${span}`;
};

/**
 * "Tonight, 11:00 pm" for today, "Wed, 10:00 pm" otherwise.
 *
 * The locale is pinned to en-US rather than the viewer's: every label around it
 * is English, and a 24-hour clock beside "Tonight" reads as a bug. The comma is
 * the separator callers split on for the big value and its unit.
 */
export const whenLabel = (airingAt: number, now: Date): string => {
  const when = new Date(airingAt * 1000);
  const time = when
    .toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
    .toLowerCase();
  const sameDay = when.toDateString() === now.toDateString();
  return sameDay ? `Tonight, ${time}` : `${DAY_LABELS[when.getDay()]}, ${time}`;
};

/* ===== the widget decks =====
 *
 * Nine facts across three tiles, all from the same Featured response. What is
 * *not* here is as deliberate as what is: finales and premieres this week
 * (neither exists in a typical week), how far through the season we are
 * (negative for the quarter before a season starts, and the countdown card
 * already owns that window), the season's best score (every unaired title has a
 * null score) and the studio of the season (the leader has two titles and
 * everything else has one). Each was computed against the fixture and dropped.
 */

/** Which weekday carries the most of a week's episodes. */
export interface BusiestDay {
  /** 'Friday' — the full name, because the tile has room for it. */
  day: string;
  count: number;
  /** Its share of the week, 0–1. Half the week on one day is the story. */
  share: number;
}

const FULL_DAYS = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

export const busiestDay = (week: Airing[]): BusiestDay | undefined => {
  if (!week.length) return undefined;
  const counts = new Map<number, number>();
  week.forEach((media) => {
    const day = new Date(media.nextAiringEpisode.airingAt * 1000).getDay();
    counts.set(day, (counts.get(day) ?? 0) + 1);
  });
  // Earliest weekday wins a tie, so the tile does not swap between renders.
  const [day, count] = [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0] - b[0])[0];
  return { day: FULL_DAYS[day], count, share: count / week.length };
};

/** How long a week of episodes actually takes to watch. */
export interface Runtime {
  minutes: number;
  /** Rounded to one decimal — "5.2 hours" is the figure the tile prints. */
  hours: number;
  episodes: number;
  /** How many of those episodes reported a duration. */
  measured: number;
}

export const weekRuntime = (week: Airing[]): Runtime | undefined => {
  const durations = week.map((media) => media.duration).filter((d): d is number => Boolean(d));
  if (!durations.length) return undefined;
  const minutes = durations.reduce((total, d) => total + d, 0);
  return {
    minutes,
    hours: Math.round((minutes / 60) * 10) / 10,
    episodes: week.length,
    measured: durations.length,
  };
};

/**
 * The best-scored of a set — undefined when nothing in it has a score yet.
 *
 * Generic so it hands back what it was given: called with `Airing[]` the result
 * still carries a guaranteed `nextAiringEpisode`, which the week slide prints.
 */
export const bestScored = <T extends FeaturedMedia>(media: T[]): T | undefined =>
  media
    .filter((item) => item.averageScore)
    // Popularity breaks a tie, and ties are common: Re:ZERO Season 4 and BLEACH
    // both score 90 in the fixture week. Without it the winner came down to
    // AniList's bucket order, and BLEACH then filled three of the nine slides.
    .sort(
      (a, b) =>
        (b.averageScore ?? 0) - (a.averageScore ?? 0) || (b.popularity ?? 0) - (a.popularity ?? 0),
    )[0];

/**
 * The most-anticipated of a set, by how many people have it listed.
 *
 * A different question from `bestScored`, and deliberately so — tonight's
 * highest score and tonight's first episode were the same title, so one of the
 * two slides said nothing new.
 */
export const mostAwaited = <T extends FeaturedMedia>(media: T[]): T | undefined =>
  [...media].sort((a, b) => (b.popularity ?? 0) - (a.popularity ?? 0))[0];

/** How much of what is on this page is actually well regarded. */
export interface ScoreShare {
  /** How many score `threshold` or better. */
  count: number;
  /** Out of how many have a score at all — not out of every title. */
  of: number;
  threshold: number;
}

export const scoreShare = (
  featured: Featured | null | undefined,
  threshold = 85,
): ScoreShare | undefined => {
  const scored = uniqueMedia(featured).filter((media) => media.averageScore);
  if (!scored.length) return undefined;
  return {
    count: scored.filter((media) => (media.averageScore ?? 0) >= threshold).length,
    of: scored.length,
    threshold,
  };
};

/** The longest run on this page. Bleach's 366 episodes, in the fixture. */
export const longestRunning = (featured: Featured | null | undefined): FeaturedMedia | undefined =>
  uniqueMedia(featured)
    .filter((media) => media.episodes)
    .sort((a, b) => (b.episodes ?? 0) - (a.episodes ?? 0))[0];

/** How the page splits between series, films and everything else. */
export interface FormatMix {
  /** The commonest format and its count — TV, 49 in the fixture. */
  lead: { format: string; count: number };
  /** The rest, largest first, for the caption. */
  rest: { format: string; count: number }[];
}

/** AniList's enum values as words, singular and plural. */
const FORMAT_WORDS: Record<string, [string, string]> = {
  TV: ['TV series', 'TV series'],
  TV_SHORT: ['short', 'shorts'],
  MOVIE: ['film', 'films'],
  SPECIAL: ['special', 'specials'],
  OVA: ['OVA', 'OVAs'],
  ONA: ['web release', 'web'],
  MUSIC: ['music video', 'music videos'],
};

/** Both forms, because a mix of 49 and 1 needs each: "49 TV series, 1 special". */
export const formatWord = (format: string, count = 2): string => {
  const pair = FORMAT_WORDS[format];
  if (pair) return count === 1 ? pair[0] : pair[1];
  return format.toLowerCase().replace(/_/g, ' ');
};

export const formatMix = (featured: Featured | null | undefined): FormatMix | undefined => {
  const counts = new Map<string, number>();
  uniqueMedia(featured).forEach((media) => {
    if (media.format) counts.set(media.format, (counts.get(media.format) ?? 0) + 1);
  });
  if (!counts.size) return undefined;
  const ranked = [...counts.entries()]
    .map(([format, count]) => ({ format, count }))
    // Alphabetical within a tie, so the caption does not reshuffle.
    .sort((a, b) => b.count - a.count || a.format.localeCompare(b.format));
  return { lead: ranked[0], rest: ranked.slice(1) };
};

/* ===== the time strip =====
 *
 * The scatter at the top of Discover: what is coming over the next five weeks,
 * placed by air date across and by how many people are waiting up.
 */

/** How far ahead the strip reaches. */
export const STRIP_DAYS = 35;

export interface StripPoint {
  media: Airing;
  /** Episode 1 — drawn as a ring rather than a filled speck. */
  premiere: boolean;
  /** Where in the band, 0 = least awaited, 1 = most. */
  height: number;
  /** 0 leads and carries the cover colour, 1 is mid, 2 is a quiet speck. */
  rank: 0 | 1 | 2;
}

export interface Strip {
  /** Everything that fits in the band, soonest first. */
  points: StripPoint[];
  /**
   * Titles whose audience the band cannot hold, drawn as a mark at its ceiling.
   *
   * There is normally exactly one: ONE PIECE has 747,774 people waiting against
   * an upper fence of 167,894. Keeping it inside squashed the other
   * twenty-five into the lower third of the band, so lifting it out buys them
   * 1.7× the vertical room.
   */
  offScale: StripPoint[];
  /** How many upcoming episodes fall past the window. Counted, not hidden. */
  beyond: number;
  /** Window bounds in epoch seconds. */
  start: number;
  end: number;
  premieres: number;
  continuing: number;
}

/**
 * The upper fence of a set, by the interquartile rule.
 *
 * A property of the response rather than a hard-coded title: whatever is
 * unusually awaited this week gets lifted out, and in a week with no outlier
 * nothing does.
 */
export const upperFence = (values: number[]): number => {
  if (!values.length) return Infinity;
  const sorted = [...values].sort((a, b) => a - b);
  const at = (f: number) => sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * f))];
  const q1 = at(0.25);
  const q3 = at(0.75);
  return q3 + 1.5 * (q3 - q1);
};

export const stripModel = (
  featured: Featured | null | undefined,
  nowSeconds: number,
  windowDays = STRIP_DAYS,
): Strip => {
  const start = nowSeconds;
  const end = nowSeconds + windowDays * DAY;
  const upcoming = uniqueMedia(featured)
    .filter(isAiring)
    .filter((media) => media.nextAiringEpisode.airingAt > nowSeconds)
    .sort((a, b) => a.nextAiringEpisode.airingAt - b.nextAiringEpisode.airingAt);
  const shown = upcoming.filter((media) => media.nextAiringEpisode.airingAt <= end);

  const fence = upperFence(upcoming.map((media) => media.popularity ?? 0));
  const isOff = (media: Airing) => (media.popularity ?? 0) > fence;
  const band = shown.filter((media) => !isOff(media));

  // The band's scale is log, over what is actually in it. Linear is unusable
  // and a scale that included the outlier is what the fence exists to avoid.
  const pops = band.map((media) => Math.max(media.popularity ?? 1, 1));
  const lo = Math.log(Math.min(...pops, 1));
  const hi = Math.log(Math.max(...pops, 1));
  const height = (popularity: number) =>
    hi === lo ? 0.5 : (Math.log(Math.max(popularity, 1)) - lo) / (hi - lo);

  // Three tiers, because twenty-odd equal dots have no subject. Only the top
  // three carry a colour: the reference keeps almost everything grey.
  const byPopularity = [...band].sort((a, b) => (b.popularity ?? 0) - (a.popularity ?? 0));
  const leads = new Set(byPopularity.slice(0, 3).map((media) => media.id));
  const mids = new Set(byPopularity.slice(3, 9).map((media) => media.id));
  const rankOf = (media: Airing): 0 | 1 | 2 =>
    leads.has(media.id) ? 0 : mids.has(media.id) ? 1 : 2;

  const toPoint = (media: Airing, inBand: boolean): StripPoint => ({
    media,
    premiere: media.nextAiringEpisode.episode === 1,
    height: inBand ? Math.min(1, Math.max(0, height(media.popularity ?? 1))) : 1,
    rank: inBand ? rankOf(media) : 0,
  });

  return {
    points: band.map((media) => toPoint(media, true)),
    offScale: shown.filter(isOff).map((media) => toPoint(media, false)),
    beyond: upcoming.length - shown.length,
    start,
    end,
    premieres: shown.filter((media) => media.nextAiringEpisode.episode === 1).length,
    continuing: shown.filter((media) => media.nextAiringEpisode.episode !== 1).length,
  };
};

/** Midnight of a point's air day, which is the column it belongs to. */
export const stripDay = (point: StripPoint): number => {
  const date = new Date(point.media.nextAiringEpisode.airingAt * 1000);
  date.setHours(0, 0, 0, 0);
  return date.getTime() / 1000;
};

/** A day's worth of the strip, for the puck to snap to. */
export interface StripColumn {
  day: number;
  /** Most awaited first — the puck names the leader. */
  points: StripPoint[];
}

export const stripColumns = (strip: Strip): StripColumn[] => {
  const byDay = new Map<number, StripPoint[]>();
  [...strip.points, ...strip.offScale].forEach((point) => {
    const day = stripDay(point);
    if (!byDay.has(day)) byDay.set(day, []);
    byDay.get(day)!.push(point);
  });
  return [...byDay.entries()]
    .map(([day, points]) => ({
      day,
      points: points.sort((a, b) => (b.media.popularity ?? 0) - (a.media.popularity ?? 0)),
    }))
    .sort((a, b) => a.day - b.day);
};

/* ===== the next-episode ring =====
 *
 * What the tile above the season card counts down to.
 */

/**
 * How long a gap the ring measures the wait against.
 *
 * A weekly show's gap, which is what almost everything on AniList is. A
 * premiere has no previous episode to measure from, so it falls back to the
 * same window — the alternative, leaving the ring empty, says nothing.
 */
export const EPISODE_GAP = 7 * DAY;

export interface NextEpisode {
  media: Airing;
  /** Seconds until it airs. */
  wait: number;
  /** How much of the gap has gone, 0..1 — the ring's fill. */
  elapsed: number;
  /** True when the countdown is to something on the viewer's own list. */
  mine: boolean;
}

/**
 * The episode the ring counts down to.
 *
 * Prefers the soonest of the viewer's own favourites and falls back to the
 * soonest thing airing at all, so the tile has something to say signed out —
 * where there is no account to link and `LinkTile` would be noise.
 *
 * Soonest, not highest-rated: the tile's claim is "this is next", and the
 * highest-rated favourite is often days behind something else on the list.
 */
export const nextEpisode = (
  featured: Featured | null | undefined,
  favorites: number[],
  nowSeconds: number,
): NextEpisode | undefined => {
  const airing = uniqueMedia(featured)
    .filter(isAiring)
    .filter((media) => media.nextAiringEpisode.airingAt > nowSeconds)
    .sort((a, b) => a.nextAiringEpisode.airingAt - b.nextAiringEpisode.airingAt);
  if (!airing.length) return undefined;

  const ids = new Set(favorites);
  const mineFirst = airing.find((media) => ids.has(media.id));
  const media = mineFirst ?? airing[0];
  const wait = media.nextAiringEpisode.airingAt - nowSeconds;
  return {
    media,
    wait,
    elapsed: Math.min(1, Math.max(0, 1 - wait / EPISODE_GAP)),
    mine: Boolean(mineFirst),
  };
};

/**
 * The wait as one figure and one word — days, then hours, then minutes.
 *
 * One unit across the whole range is either always huge or always tiny, and the
 * unit has to stay a single word: "days until episode 16" was wider than the
 * ring and crossed its ticks.
 */
export const waitLabel = (seconds: number): { value: number; unit: string } => {
  const days = Math.floor(seconds / DAY);
  if (days >= 1) return { value: days, unit: days === 1 ? 'day' : 'days' };
  const hours = Math.floor(seconds / 3600);
  if (hours >= 1) return { value: hours, unit: hours === 1 ? 'hour' : 'hours' };
  const minutes = Math.max(0, Math.floor(seconds / 60));
  return { value: minutes, unit: minutes === 1 ? 'minute' : 'minutes' };
};
