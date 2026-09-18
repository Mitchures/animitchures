import { getNavSections, getBarItems, getDrawerItems } from 'layout/nav-items';
import { User, AnilistUser } from 'context/types';

const user = { uid: 'u1', displayName: 'Mitchell', photoURL: null, email: 'm@example.com' } as User;
const anilistUser = { id: 1, name: 'mitch' } as unknown as AnilistUser;

const idsIn = (sections: ReturnType<typeof getNavSections>, heading: string) =>
  sections.find((s) => s.heading === heading)?.items.map((i) => i.id) ?? [];

test('signed out: Discover, Calendar and Browse, then Login; no empty sections', () => {
  const sections = getNavSections({ user: null, anilistUser: null });

  expect(idsIn(sections, 'Menu')).toEqual(['discover', 'calendar', 'browse']);
  expect(idsIn(sections, 'General')).toEqual(['login']);
  expect(sections.map((s) => s.heading)).not.toContain('Anilist');
  expect(sections.every((s) => s.items.length > 0)).toBe(true);
});

test('signed in without anilist: favorites and settings appear, no Anilist section', () => {
  const sections = getNavSections({ user, anilistUser: null });

  expect(idsIn(sections, 'Menu')).toEqual(['discover', 'calendar', 'browse', 'favorites']);
  expect(idsIn(sections, 'General')).toEqual(['settings', 'logout']);
  expect(sections.map((s) => s.heading)).not.toContain('Anilist');
});

test('signed in with anilist linked: watchlist, taste and social appear', () => {
  const sections = getNavSections({ user, anilistUser });

  expect(idsIn(sections, 'Anilist')).toEqual(['watchlist', 'taste', 'social']);
});

test('every item declares its group for the pill column tabs', () => {
  const items = getNavSections({ user, anilistUser }).flatMap((s) => s.items);

  expect(items.every((i) => ['explore', 'library', 'account'].includes(i.group))).toBe(true);
  expect(items.find((i) => i.id === 'watchlist')?.group).toBe('library');
});

test('the tab bar always has four destinations, in order', () => {
  const ids = (sections: ReturnType<typeof getNavSections>) => getBarItems(sections).map((i) => i.id);

  expect(ids(getNavSections({ user, anilistUser }))).toEqual(['discover', 'calendar', 'browse', 'watchlist']);
  expect(ids(getNavSections({ user, anilistUser: null }))).toEqual(['discover', 'calendar', 'browse', 'favorites']);
  expect(ids(getNavSections({ user: null, anilistUser: null }))).toEqual(['discover', 'calendar', 'browse', 'login']);
});

test('the drawer holds what the bar and account row do not', () => {
  const ids = getDrawerItems(getNavSections({ user, anilistUser })).map((i) => i.id);

  expect(ids).toEqual(['favorites', 'taste', 'social']);
});

test('logout is flagged so consumers can style and wire it differently', () => {
  const sections = getNavSections({ user, anilistUser: null });
  const logout = sections.flatMap((s) => s.items).find((i) => i.id === 'logout');

  expect(logout?.isLogout).toBe(true);
});

test('discover is end-matched so it is not active on every route', () => {
  const sections = getNavSections({ user: null, anilistUser: null });
  const discover = sections.flatMap((s) => s.items).find((i) => i.id === 'discover');

  expect(discover?.to).toBe('/');
  expect(discover?.end).toBe(true);
});
