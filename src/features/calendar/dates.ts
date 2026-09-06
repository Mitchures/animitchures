import { Airing } from './types';

export const DAY = 86_400;
const MS = 1000;

/** Monday-first, matching the day headers the grid renders. */
export const startOfWeek = (date: Date): Date => {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const weekday = (start.getDay() + 6) % 7;
  start.setDate(start.getDate() - weekday);
  return start;
};

export const startOfMonth = (date: Date): Date => {
  const start = new Date(date.getFullYear(), date.getMonth(), 1);
  start.setHours(0, 0, 0, 0);
  return start;
};

export const addDays = (date: Date, days: number): Date => {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
};

export const addMonths = (date: Date, months: number): Date => {
  const next = new Date(date);
  next.setMonth(next.getMonth() + months, 1);
  return next;
};

export const sameDay = (a: Date, b: Date): boolean =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

/**
 * The days a month grid has to draw, including the neighbouring days that
 * fill out the first and last weeks.
 *
 * Those leading and trailing days are kept rather than blanked: a grid that
 * starts mid-row reads as broken, and the airings on them are real.
 */
export const monthGrid = (month: Date): Date[] => {
  const first = startOfWeek(startOfMonth(month));
  const days: Date[] = [];
  for (let index = 0; index < 42; index += 1) days.push(addDays(first, index));
  // Six rows is the worst case; trim the last row when it is entirely spill.
  const trimmed = days.slice(0, 35);
  const lastRow = days.slice(35);
  return lastRow.some((day) => day.getMonth() === month.getMonth()) ? days : trimmed;
};

/** Unix seconds, inclusive of the whole final day. */
export const rangeOf = (days: Date[]): { start: number; end: number } => {
  const first = new Date(days[0]);
  first.setHours(0, 0, 0, 0);
  const last = new Date(days[days.length - 1]);
  last.setHours(23, 59, 59, 999);
  return { start: Math.floor(first.getTime() / MS), end: Math.floor(last.getTime() / MS) };
};

/** Airings keyed by `YYYY-M-D`, each list in broadcast order. */
export const byDay = (airings: Airing[]): Map<string, Airing[]> => {
  const map = new Map<string, Airing[]>();
  for (const airing of airings) {
    const date = new Date(airing.airingAt * MS);
    const key = dayKey(date);
    const bucket = map.get(key) ?? [];
    bucket.push(airing);
    map.set(key, bucket);
  }
  for (const bucket of map.values()) bucket.sort((a, b) => a.airingAt - b.airingAt);
  return map;
};

export const dayKey = (date: Date): string =>
  `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;

export const timeOf = (airingAt: number): string =>
  new Date(airingAt * MS).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
