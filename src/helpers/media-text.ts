/**
 * Title-cases a value that AniList returns SCREAMING_SNAKE — "NOT_YET_RELEASED"
 * becomes "Not yet released".
 *
 * Short values are passed through untouched because they are almost always
 * acronyms that would be ruined by lowercasing: TV, OVA, ONA.
 */
export const titleCase = (text: string): string => {
  if (text.length <= 3) return text;
  const spaced = text.includes('_') ? text.replace(/_/g, ' ') : text;
  return spaced.charAt(0).toUpperCase() + spaced.substring(1).toLowerCase();
};

const SEASONS: Record<string, string> = {
  WINTER: 'Winter',
  SPRING: 'Spring',
  SUMMER: 'Summer',
  FALL: 'Fall',
};

/** "FALL" -> "Fall". Returns undefined for a season AniList did not give us. */
export const seasonLabel = (season?: string | null): string | undefined =>
  season ? SEASONS[season] : undefined;

/**
 * The studio credited as the main one, or an empty string.
 *
 * A media can list several studios — the animation studio plus producers — and
 * only one is flagged isMain. The previous version of this in Sidebar mapped
 * rather than found, so it produced `[false, false, 'Sunrise']` and only
 * rendered correctly because React discards the falses.
 */
type StudioEdge = { isMain?: boolean; node?: { id?: number; name?: string } };

/** The studio that actually animated a title, as a linkable node. */
export const mainStudioNode = (
  studios?: { edges?: unknown } | null,
): { id: number; name: string } | null => {
  const edges = (studios?.edges ?? []) as StudioEdge[];
  const node = edges.find((edge) => edge?.isMain)?.node;
  return node?.id && node?.name ? { id: node.id, name: node.name } : null;
};

export const mainStudio = (studios?: { edges?: unknown } | null): string =>
  mainStudioNode(studios)?.name ?? '';
