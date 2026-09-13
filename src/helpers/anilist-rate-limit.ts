import { makeVar } from '@apollo/client';

/**
 * AniList allows **30 requests per minute**, not the 90 its docs describe — the
 * API has been running degraded for a long time. Confirmed against the live
 * endpoint:
 *
 * ```
 * x-ratelimit-limit: 30
 * ```
 *
 * Spending that budget returns HTTP 429 with a Cloudflare *HTML* body, which is
 * why the failure surfaces as `ServerParseError: Unexpected token '<'` rather
 * than anything mentioning rate limits.
 *
 * Before this module a 429 was logged and dropped: Apollo's default
 * `errorPolicy` discards the response, so the page rendered empty with no
 * retry and nothing on screen to explain it. One refusal from any source blanked
 * a page until a manual reload.
 */

/** First backoff step. Later attempts double it. */
export const BASE_RETRY_MS = 2_000;

/** Nothing waits longer than this, whatever the server or the maths says. */
export const MAX_RETRY_MS = 30_000;

/**
 * Four attempts spans roughly 2s + 4s + 8s + 16s of waiting, which covers most
 * of a 60-second window without hammering an API that has already said stop.
 */
export const MAX_RETRY_ATTEMPTS = 4;

/**
 * How long a refusal has to persist before the reader is told about it.
 *
 * Twice the first backoff step, so a 429 that clears on the first retry — the
 * common case — is never mentioned at all. Showing it immediately meant a
 * notice appearing and vanishing inside two seconds, ahead of the skeletons it
 * was explaining: the reader saw a warning, then loaders, then content, and the
 * warning had described a problem that was already over. The page keeps showing
 * its skeleton for this window, which is what the wait actually is.
 */
export const NOTICE_DELAY_MS = BASE_RETRY_MS * 2;

/**
 * Whether AniList is currently refusing us for volume.
 *
 * A reactive variable for the same reason as `anilistTokenRefusedVar`: the code
 * that discovers it is a link, which lives outside the component tree.
 * Components read it with `useReactiveVar` and drop the notice the moment a
 * request succeeds again.
 */
export const anilistRateLimitedVar = makeVar(false);

type HttpishError = {
  statusCode?: number;
  response?: { status?: number; headers?: { get?: (name: string) => string | null } };
};

const statusOf = (error: unknown): number | undefined => {
  const candidate = error as HttpishError | null | undefined;
  return candidate?.statusCode ?? candidate?.response?.status;
};

/**
 * A 429 and nothing else.
 *
 * Deliberately narrow. A 400 is how AniList reports a refused token, and
 * retrying that would both delay the reconnect prompt and never succeed; a 500
 * is not ours to retry into.
 */
export const isRateLimited = (error: unknown): boolean => statusOf(error) === 429;

/**
 * `Retry-After` in milliseconds, when the browser is allowed to read it.
 *
 * Usually it is not. AniList's `access-control-expose-headers` lists only
 * `X-RateLimit-*`, `Content-Length` and `Content-Range`, so a cross-origin read
 * of `Retry-After` returns null and we fall through to backoff. It is read
 * anyway because it costs nothing and is exactly right when it is there.
 */
const retryAfterMs = (error: unknown): number | null => {
  const headers = (error as HttpishError | null | undefined)?.response?.headers;
  if (typeof headers?.get !== 'function') return null;

  const raw = headers.get('retry-after');
  if (!raw) return null;

  const seconds = Number(raw);
  if (Number.isFinite(seconds) && seconds > 0) return seconds * 1000;

  // The header's other legal form is an HTTP date.
  const at = Date.parse(raw);
  return Number.isNaN(at) ? null : Math.max(at - Date.now(), 0);
};

/**
 * How long to wait before attempt `attempt` (1-based).
 *
 * Exponential with +/-25% jitter. The jitter matters more than it looks: a page
 * that fires several queries at once would otherwise retry them all in the same
 * millisecond and spend the fresh budget in one burst.
 */
export const retryDelayMs = (attempt: number, error?: unknown): number => {
  const fromServer = retryAfterMs(error);
  if (fromServer !== null) return Math.min(fromServer, MAX_RETRY_MS);

  const stepped = Math.min(BASE_RETRY_MS * 2 ** (attempt - 1), MAX_RETRY_MS);
  const jittered = stepped * (0.75 + Math.random() * 0.5);
  return Math.round(Math.min(jittered, MAX_RETRY_MS));
};

let noticeTimer: ReturnType<typeof setTimeout> | null = null;

/**
 * Called when a request comes back 429.
 *
 * Arms the notice rather than raising it. A refusal that resolves inside
 * `NOTICE_DELAY_MS` never surfaces, so a brief wobble looks like a page that
 * took a moment rather than an error that came and went.
 */
export const markRateLimited = (): void => {
  if (anilistRateLimitedVar() || noticeTimer) return;

  noticeTimer = setTimeout(() => {
    noticeTimer = null;
    anilistRateLimitedVar(true);
  }, NOTICE_DELAY_MS);
};

/**
 * Called when anything succeeds, which is proof the window has reopened.
 *
 * Disarms a notice that has not fired yet as well as clearing one that has —
 * without the first, a recovered request would still be followed by a warning
 * about a problem that had already passed.
 */
export const clearRateLimited = (): void => {
  if (noticeTimer) {
    clearTimeout(noticeTimer);
    noticeTimer = null;
  }
  if (anilistRateLimitedVar()) anilistRateLimitedVar(false);
};
