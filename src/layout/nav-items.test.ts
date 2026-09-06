import { getNavSections } from 'layout/nav-items';
import { User, AnilistUser } from 'context/types';

const user = { uid: 'u1', displayName: 'Mitchell', photoURL: null, email: 'm@example.com' } as User;
const anilistUser = { id: 1, name: 'mitch' } as unknown as AnilistUser;

const idsIn = (sections: ReturnType<typeof getNavSections>, heading: string) =>
  sections.find((s) => s.heading === heading)?.items.map((i) => i.id) ?? [];

test('signed out: Discover and Login only, no empty sections', () => {
  const sections = getNavSections({ user: null, anilistUser: null });

  expect(idsIn(sections, 'Menu')).toEqual(['discover']);
  expect(idsIn(sections, 'General')).toEqual(['login']);
  expect(sections.map((s) => s.heading)).not.toContain('Anilist');
  expect(sections.every((s) => s.items.length > 0)).toBe(true);
});

test('signed in without anilist: favorites and settings appear, no Anilist section', () => {
  const sections = getNavSections({ user, anilistUser: null });

  expect(idsIn(sections, 'Menu')).toEqual(['discover', 'favorites']);
  expect(idsIn(sections, 'General')).toEqual(['settings', 'logout']);
  expect(sections.map((s) => s.heading)).not.toContain('Anilist');
});

test('signed in with anilist linked: watchlist appears', () => {
  const sections = getNavSections({ user, anilistUser });

  expect(idsIn(sections, 'Anilist')).toEqual(['watchlist', 'taste']);
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
