import './RateLimitNotice.css';

/**
 * Shown while AniList is refusing us for volume.
 *
 * AniList allows 30 requests a minute. Spending that used to be invisible: the
 * response was dropped, the page rendered empty, and the only trace was a
 * `ServerParseError` in the console about an unexpected '<' — the opening angle
 * bracket of Cloudflare's HTML error page. Every report of this described it as
 * "the page didn't load".
 *
 * There is no button, because there is nothing for the reader to do — the retry
 * link is already waiting and will ask again. This exists so the wait reads as
 * a wait rather than as an empty page.
 */
function RateLimitNotice() {
  return (
    <div className="rateLimit" role="status" aria-live="polite">
      <span className="rateLimit__pulse" aria-hidden="true" />
      <p>
        <strong>AniList is asking us to slow down.</strong> Retrying in a moment — this page will
        fill in on its own.
      </p>
    </div>
  );
}

export default RateLimitNotice;
