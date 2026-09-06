/**
 * Routes for the things a title links out to: people and studios.
 *
 * Shares the slug rule with `mediaPath` rather than restating it — the two
 * drifting would produce a different URL shape for a staff member than for a
 * show, which is the kind of inconsistency nobody notices until a link breaks.
 */
export const entitySlug = (name: string): string =>
  encodeURIComponent(name.replace(/,?[ ]/g, '-').toLowerCase());

export const staffPath = (id: number | string, name: string): string =>
  `/staff/${id}/${entitySlug(name)}`;

export const characterPath = (id: number | string, name: string): string =>
  `/character/${id}/${entitySlug(name)}`;

export const studioPath = (id: number | string, name: string): string =>
  `/studio/${id}/${entitySlug(name)}`;
