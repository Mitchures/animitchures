import { makeVar } from '@apollo/client';

/**
 * The language titles and names are shown in.
 *
 * Reactive variables rather than plain module state, and that detail is the
 * whole mechanism. Apollo caches the result of a type policy's `read` and only
 * re-runs it when something it depends on changes — a bare module variable is
 * invisible to that, so the first language chosen stuck and every later change
 * was ignored. Reading a reactive var *inside* `read` registers the dependency,
 * so setting it invalidates exactly the fields that used it and the affected
 * queries re-render on their own.
 */

export type TitleLang = 'ROMAJI' | 'ENGLISH' | 'NATIVE';
export type NameLang = 'ROMAJI' | 'NATIVE';

export const titleLanguageVar = makeVar<TitleLang>('ROMAJI');
export const nameLanguageVar = makeVar<NameLang>('ROMAJI');

export const setTitleLanguage = (language: TitleLang): void => {
  if (titleLanguageVar() !== language) titleLanguageVar(language);
};

export const setNameLanguage = (language: NameLang): void => {
  if (nameLanguageVar() !== language) nameLanguageVar(language);
};

/** The MediaTitle field the current choice maps to. Call inside `read`. */
export const titleField = (): 'romaji' | 'english' | 'native' => {
  const language = titleLanguageVar();
  return language === 'ENGLISH' ? 'english' : language === 'NATIVE' ? 'native' : 'romaji';
};
