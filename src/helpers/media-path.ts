/**
 * The route for a media item: `/anime/:id/:slug`.
 *
 * Extracted so the spotlight and Card cannot drift apart — two copies of this
 * slug rule would eventually disagree and produce two URLs for one title.
 */
export const mediaPath = (id: number | string, title: string): string =>
  `/anime/${id}/${encodeURIComponent(title.replace(/,?[ ]/g, '-').toLowerCase())}`;
