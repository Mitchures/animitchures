/**
 * The settings that live in this app rather than on AniList.
 *
 * They are applied by stamping attributes on <html>, which is why the CSS was
 * converted from bare `prefers-color-scheme` blocks to ones that also answer
 * to `[data-theme]`: "System" still follows the OS, but an explicit choice now
 * beats it in either direction.
 */

import { setNameLanguage, setTitleLanguage } from 'helpers/title-language';

export type Theme = 'system' | 'light' | 'dark';
export type Density = 'comfortable' | 'compact';
export type TitleLanguage = 'ROMAJI' | 'ENGLISH' | 'NATIVE';
export type StaffLanguage = 'ROMAJI' | 'NATIVE';

export interface Preferences {
  theme: Theme;
  density: Density;
  reduceMotion: boolean;
  titleLanguage: TitleLanguage;
  staffLanguage: StaffLanguage;
  startPage: string;
}

export const DEFAULT_PREFERENCES: Preferences = {
  theme: 'system',
  density: 'comfortable',
  reduceMotion: false,
  titleLanguage: 'ROMAJI',
  staffLanguage: 'ROMAJI',
  startPage: '/',
};

/**
 * Mirrored to localStorage as well as Firestore.
 *
 * Firestore is the durable copy, but it only arrives after auth resolves —
 * a couple of hundred milliseconds during which the page would render in the
 * wrong theme and then snap. Reading the mirror synchronously before React
 * mounts is what removes that flash.
 */
const STORAGE_KEY = 'preferences';

export const readCachedPreferences = (): Preferences => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? { ...DEFAULT_PREFERENCES, ...JSON.parse(raw) } : DEFAULT_PREFERENCES;
  } catch {
    // A malformed mirror is not worth failing a page load over.
    return DEFAULT_PREFERENCES;
  }
};

export const cachePreferences = (preferences: Preferences): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
  } catch {
    // Private browsing, quota — the Firestore copy is still authoritative.
  }
};

/** Stamps the preferences onto <html> for the CSS to read. */
export const applyPreferences = (preferences: Preferences): void => {
  const root = document.documentElement;

  if (preferences.theme === 'system') root.removeAttribute('data-theme');
  else root.setAttribute('data-theme', preferences.theme);

  root.setAttribute('data-density', preferences.density);

  // Only ever set, never cleared to "no": someone whose OS asks for reduced
  // motion must keep getting it even with this switch off.
  if (preferences.reduceMotion) root.setAttribute('data-motion', 'reduced');
  else root.removeAttribute('data-motion');

  // Read by the Apollo field policy that resolves `userPreferred`.
  setTitleLanguage(preferences.titleLanguage);
  setNameLanguage(preferences.staffLanguage);
};
