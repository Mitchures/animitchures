export interface TilePalette {
  cap: string;
  body: string;
  accent: string;
}

/** Fixed palettes for tiles that have no title behind them (spec §4). */
export const PALETTES: Record<'score' | 'night' | 'fall' | 'link', TilePalette> = {
  score: { cap: '#f5b98c', body: '#b9d95e', accent: '#1f9a3a' },
  night: { cap: '#7fb6ff', body: '#7a4dff', accent: '#d64dff' },
  fall: { cap: '#f8d3a3', body: '#f58a2b', accent: '#e04a2a' },
  link: { cap: '#fbc9dc', body: '#ff5fa2', accent: '#ff2d86' },
};

export type TileTreatment = 'band' | 'blob' | 'core';

export interface SeasonChip {
  label: string;
  background: string;
  color: string;
}

/**
 * A season's own chip colours.
 *
 * Needed because AniList files an undated title under the season it is
 * *expected* in, so a row of upcoming titles spans several seasons — printing
 * one season across the row would be wrong. Kept pale enough to sit on the
 * frosted tiles and on white.
 */
export const SEASON_CHIPS: Record<string, SeasonChip> = {
  WINTER: { label: 'Winter', background: '#bfe0f3', color: '#123246' },
  SPRING: { label: 'Spring', background: '#cceab8', color: '#1b3a20' },
  SUMMER: { label: 'Summer', background: '#f7e0ac', color: '#43300f' },
  FALL: { label: 'Fall', background: '#f5c9ac', color: '#43220f' },
};

export const seasonChip = (season?: string | null): SeasonChip | undefined =>
  season ? SEASON_CHIPS[season] : undefined;

export interface GenreTile {
  treatment: TileTreatment;
  palette: TilePalette;
}

/**
 * Every AniList genre's tile: a palette and a treatment, together, because both
 * are part of the genre's identity — Action is the same red and the same shape
 * wherever it appears.
 *
 * **The colour is assigned, not derived.** Seeding each from its most popular
 * title's `coverImage.color` collapses: Attack on Titan leads Action, Drama,
 * Fantasy *and* Mystery, so four tiles come out the same orange, and Death Note
 * — which leads Psychological — has no colour in AniList's data at all. A genre
 * is a category rather than a piece of content, so it gets a fixed identity.
 *
 * The values come from one formula rather than eighteen separate decisions:
 * **cap at L84, body at L64/S62, accent a +26° hue shift at L57.** Accents shift
 * hue sideways rather than darkening, which is what the widget palettes above do
 * — an earlier hand-picked set let them run to near-black (`#8e1f1b`) and three
 * dark tiles beside eight pastel ones read as a different family.
 *
 * **The treatment is assigned, not random.** Random would reshuffle on every
 * page load, and a rotation draws a visible diagonal through a four-column grid.
 * Balanced 6/6/6, tuned so the genres that usually lead the list do not sit next
 * to a neighbour sharing their treatment. Counts shift by season, so an
 * occasional adjacent pair is possible; a stable identity is worth more than
 * guaranteeing it never happens.
 */
export const GENRE_TILES: Record<string, GenreTile> = {
  Action: {
    treatment: 'band',
    palette: { cap: '#e3ccca', body: '#dc766a', accent: '#da9649' },
  },
  Adventure: {
    treatment: 'band',
    palette: { cap: '#cae3d3', body: '#6adc94', accent: '#49dabd' },
  },
  Comedy: {
    treatment: 'band',
    palette: { cap: '#e3daca', body: '#dcb66a', accent: '#cbda49' },
  },
  Drama: {
    treatment: 'blob',
    palette: { cap: '#d1cae3', body: '#8c6adc', accent: '#b349da' },
  },
  Ecchi: {
    treatment: 'blob',
    palette: { cap: '#e3cacf', body: '#dc6a81', accent: '#da6b49' },
  },
  Fantasy: {
    treatment: 'core',
    palette: { cap: '#cadde3', body: '#6ac3dc', accent: '#497cda' },
  },
  Horror: {
    treatment: 'core',
    palette: { cap: '#d7cfde', body: '#a582c4', accent: '#ba65bd' },
  },
  'Mahou Shoujo': {
    treatment: 'band',
    palette: { cap: '#e3cadc', body: '#dc6abe', accent: '#da4974' },
  },
  Mecha: {
    treatment: 'blob',
    palette: { cap: '#cdd7df', body: '#7ba9cc', accent: '#5d6bc6' },
  },
  Music: {
    treatment: 'core',
    palette: { cap: '#cae3de', body: '#6adcc5', accent: '#49b8da' },
  },
  Mystery: {
    treatment: 'core',
    palette: { cap: '#cae3e3', body: '#6adcdc', accent: '#499bda' },
  },
  Psychological: {
    treatment: 'band',
    palette: { cap: '#d0d4dc', body: '#899bbd', accent: '#756eb4' },
  },
  Romance: {
    treatment: 'blob',
    palette: { cap: '#e3cad5', body: '#dc6a9f', accent: '#da494e' },
  },
  'Sci-Fi': {
    treatment: 'core',
    palette: { cap: '#cacfe3', body: '#6a85dc', accent: '#6649da' },
  },
  'Slice of Life': {
    treatment: 'blob',
    palette: { cap: '#d5e3ca', body: '#9fdc6a', accent: '#4eda49' },
  },
  Sports: {
    treatment: 'band',
    palette: { cap: '#e3d5ca', body: '#dc9c6a', accent: '#dac649' },
  },
  Supernatural: {
    treatment: 'core',
    palette: { cap: '#decae3', body: '#c56adc', accent: '#da49b8' },
  },
  Thriller: {
    treatment: 'blob',
    palette: { cap: '#cecede', body: '#7e7ec8', accent: '#8b61c2' },
  },
};

/** The slate that Psychological uses, and anything AniList adds that we have not mapped. */
const UNMAPPED_GENRE: GenreTile = GENRE_TILES.Psychological;

export const genreTile = (genre: string): GenreTile => GENRE_TILES[genre] ?? UNMAPPED_GENRE;

/**
 * Three hues from one AniList `coverImage.color`: a light cap, the colour
 * itself, and a deep accent. `color-mix` is Safari 16.2+/Chrome 111+; the
 * strings are handed straight to CSS custom properties.
 */
export const paletteFromColor = (
  hex: string | null | undefined,
  fallback: TilePalette = PALETTES.score,
): TilePalette => {
  if (!hex) return fallback;
  return {
    cap: `color-mix(in srgb, ${hex} 45%, white)`,
    body: hex,
    accent: `color-mix(in srgb, ${hex} 65%, black)`,
  };
};
