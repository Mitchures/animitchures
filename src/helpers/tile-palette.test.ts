import { paletteFromColor, PALETTES } from './tile-palette';

test('derives cap, body and accent from a cover colour', () => {
  const p = paletteFromColor('#1abbd6');
  expect(p.body).toBe('#1abbd6');
  expect(p.cap).toBe('color-mix(in srgb, #1abbd6 45%, white)');
  expect(p.accent).toBe('color-mix(in srgb, #1abbd6 65%, black)');
});

test('falls back to the given palette when AniList has no colour', () => {
  expect(paletteFromColor(null, PALETTES.night)).toEqual(PALETTES.night);
  expect(paletteFromColor(undefined)).toEqual(PALETTES.score);
});
