import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import {
  BASE_RETRY_MS,
  MAX_RETRY_ATTEMPTS,
  MAX_RETRY_MS,
  NOTICE_DELAY_MS,
  anilistRateLimitedVar,
  clearRateLimited,
  isRateLimited,
  markRateLimited,
  retryDelayMs,
} from './anilist-rate-limit';

/** Shapes Apollo actually hands the error link, captured from a real refusal. */
const serverParseError = (statusCode: number, headers?: Record<string, string>) =>
  Object.assign(new Error('Unexpected token < in JSON'), {
    statusCode,
    response: headers ? { headers: new Headers(headers) } : undefined,
  });

beforeEach(() => {
  vi.useFakeTimers();
  clearRateLimited();
  anilistRateLimitedVar(false);
});

afterEach(() => {
  clearRateLimited();
  vi.useRealTimers();
});

describe('isRateLimited', () => {
  test('matches the 429 AniList sends when the minute budget is spent', () => {
    expect(isRateLimited(serverParseError(429))).toBe(true);
  });

  test('ignores the 400 that means a refused token', () => {
    // Retrying this would delay the reconnect prompt and never succeed.
    expect(isRateLimited(serverParseError(400))).toBe(false);
    expect(isRateLimited(serverParseError(401))).toBe(false);
  });

  test('ignores server errors and anything unrecognisable', () => {
    expect(isRateLimited(serverParseError(500))).toBe(false);
    expect(isRateLimited(new Error('Failed to fetch'))).toBe(false);
    expect(isRateLimited(undefined)).toBe(false);
    expect(isRateLimited(null)).toBe(false);
  });
});

describe('retryDelayMs', () => {
  test('backs off further on each attempt', () => {
    const first = retryDelayMs(1, serverParseError(429));
    const third = retryDelayMs(3, serverParseError(429));
    expect(third).toBeGreaterThan(first);
  });

  test('stays inside the jitter band around the exponential step', () => {
    // Jitter is +/-25%, so attempt 1 sits around BASE and never below three
    // quarters of it. Asserting the band rather than a value keeps this honest
    // about the randomness instead of freezing it.
    const delay = retryDelayMs(1, serverParseError(429));
    expect(delay).toBeGreaterThanOrEqual(BASE_RETRY_MS * 0.75);
    expect(delay).toBeLessThanOrEqual(BASE_RETRY_MS * 1.25);
  });

  test('never waits longer than the cap, however many attempts', () => {
    expect(retryDelayMs(MAX_RETRY_ATTEMPTS + 5, serverParseError(429))).toBeLessThanOrEqual(
      MAX_RETRY_MS,
    );
  });

  test('honours Retry-After when the browser is allowed to read it', () => {
    const delay = retryDelayMs(1, serverParseError(429, { 'retry-after': '12' }));
    expect(delay).toBe(12_000);
  });

  test('caps a hostile Retry-After rather than freezing the page for an hour', () => {
    const delay = retryDelayMs(1, serverParseError(429, { 'retry-after': '3600' }));
    expect(delay).toBe(MAX_RETRY_MS);
  });

  test('falls back to backoff when the header is missing, which is the CORS case', () => {
    // AniList exposes only X-RateLimit-*; Retry-After is not in
    // access-control-expose-headers, so cross-origin reads return null.
    const delay = retryDelayMs(1, serverParseError(429, { 'x-not-exposed': '5' }));
    expect(delay).toBeGreaterThanOrEqual(BASE_RETRY_MS * 0.75);
  });
});

describe('the notice flag', () => {
  test('says nothing at all while the retry still might work', () => {
    markRateLimited();
    expect(anilistRateLimitedVar()).toBe(false);

    vi.advanceTimersByTime(NOTICE_DELAY_MS - 1);
    expect(anilistRateLimitedVar()).toBe(false);
  });

  test('surfaces once the refusal has outlasted the grace period', () => {
    markRateLimited();
    vi.advanceTimersByTime(NOTICE_DELAY_MS);
    expect(anilistRateLimitedVar()).toBe(true);
  });

  test('a refusal that recovers in time is never mentioned', () => {
    // The behaviour this whole delay exists for: a warning that appeared and
    // vanished before the skeletons it was explaining described a problem the
    // reader never had.
    markRateLimited();
    vi.advanceTimersByTime(NOTICE_DELAY_MS - 500);
    clearRateLimited();

    vi.advanceTimersByTime(NOTICE_DELAY_MS * 2);
    expect(anilistRateLimitedVar()).toBe(false);
  });

  test('clears a notice that did surface', () => {
    markRateLimited();
    vi.advanceTimersByTime(NOTICE_DELAY_MS);
    expect(anilistRateLimitedVar()).toBe(true);

    clearRateLimited();
    expect(anilistRateLimitedVar()).toBe(false);
  });

  test('repeated refusals do not restart the clock', () => {
    // Every retry of every in-flight query calls this. If each one re-armed the
    // timer, a page firing several queries would push the notice out for ever.
    markRateLimited();
    vi.advanceTimersByTime(NOTICE_DELAY_MS - 100);
    markRateLimited();
    vi.advanceTimersByTime(100);

    expect(anilistRateLimitedVar()).toBe(true);
  });

  test('clearing when already clear does not churn the var', () => {
    clearRateLimited();
    expect(anilistRateLimitedVar()).toBe(false);
  });
});
