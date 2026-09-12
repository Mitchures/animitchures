/**
 * Strips everything from a fragment of third-party HTML except the handful of
 * formatting tags AniList actually uses.
 *
 * AniList descriptions are community-edited and arrive as HTML, and the app
 * renders them through `dangerouslySetInnerHTML`. Sampling 25 trending titles
 * found only `<br>`, `<b>` and `<i>` — no event attributes, no `<script>`, no
 * `javascript:` URLs — so AniList appears to sanitise on its side. "Appears to"
 * is the problem: that is an observation of today's output, not a guarantee
 * about a field strangers can edit, and the app stores an AniList access token
 * in localStorage where any injected script could read it.
 *
 * Allowlist rather than blocklist. A blocklist has to anticipate every vector;
 * an allowlist only has to name what is wanted.
 */
const ALLOWED = new Set(['br', 'b', 'strong', 'i', 'em']);

/**
 * Removed whole, rather than unwrapped.
 *
 * Everything else disallowed gets unwrapped so its text survives — dropping an
 * `<a>` should not drop the words it wrapped. For these the text is not prose:
 * unwrapping `<script>alert(1)</script>` leaves a visible "alert(1)" in the
 * synopsis. Inert, but nonsense on the page.
 */
const DROP_WHOLE = new Set([
  'script',
  'style',
  'iframe',
  'object',
  'embed',
  'noscript',
  'template',
  'svg',
  'math',
  'link',
  'meta',
  'title',
]);

export const sanitizeHtml = (html: string): string => {
  // DOMParser builds an inert document — no scripts run, no images load, no
  // network requests fire, even for markup that would be hostile in the page.
  const doc = new DOMParser().parseFromString(html, 'text/html');

  const scrub = (node: Element) => {
    // Snapshot first: unwrapping a child mutates the live child list.
    for (const child of Array.from(node.children)) scrub(child);

    const tag = node.tagName.toLowerCase();
    if (DROP_WHOLE.has(tag)) {
      node.remove();
      return;
    }

    if (!ALLOWED.has(tag)) {
      // Unwrap rather than delete, so the text inside a disallowed tag
      // survives — dropping <a> should not drop the words it wrapped.
      node.replaceWith(...Array.from(node.childNodes));
      return;
    }

    // No attributes at all on what remains. None of the allowed tags need any,
    // and this closes `style`, `on*` handlers and anything else in one rule.
    for (const attr of Array.from(node.attributes)) node.removeAttribute(attr.name);
  };

  for (const child of Array.from(doc.body.children)) scrub(child);
  return doc.body.innerHTML;
};
