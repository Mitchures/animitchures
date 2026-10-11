import { paletteFromColor, PALETTES } from './tile-palette';

test('keeps the cover hue and fixes the lightness to the genre formula', () => {
  const p = paletteFromColor('#1abbd6');
  // The cover is a cyan at L47 / S78: the body lands at L64 with the saturation
  // capped, the cap at L84, and the accent 26° round the wheel at L57.
  expect(p.body).toBe('#63d1e3');
  expect(p.cap).toBe('#c0e6ed');
  expect(p.accent).toBe('#4586de');
});

test('a dark cover does not make a dark tile', () => {
  // Overgeared's cover, which used to pass straight through as the body.
  const p = paletteFromColor('#50281e');
  expect(p.body).toBe('#cd8a79');
});

test('a pale cover does not make a white tile', () => {
  // JUJUTSU KAISEN's, which left white text on white glass.
  const p = paletteFromColor('#78aee4');
  expect(p.body).toBe('#66a3e0');
});

test('a colour that does not parse falls back like no colour', () => {
  expect(paletteFromColor('not-a-colour', PALETTES.night)).toEqual(PALETTES.night);
});

test('falls back to the given palette when AniList has no colour', () => {
  expect(paletteFromColor(null, PALETTES.night)).toEqual(PALETTES.night);
  expect(paletteFromColor(undefined)).toEqual(PALETTES.score);
});
