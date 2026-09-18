import { screen, fireEvent } from '@testing-library/react';

import TabBar from './TabBar';
import { getNavSections } from './nav-items';
import { renderWithProviders } from 'test-utils';
import { User, AnilistUser } from 'context/types';

const user = { uid: 'u1', displayName: 'Mitchell', photoURL: null, email: 'm@example.com' } as User;
const anilistUser = { id: 1, name: 'mitch' } as unknown as AnilistUser;

test('four destinations then More, with More wired to the drawer', () => {
  const onMore = vi.fn();
  renderWithProviders(
    <TabBar sections={getNavSections({ user, anilistUser })} moreOpen={false} onMore={onMore} />,
  );
  const links = screen.getAllByRole('link');
  expect(links.map((l) => l.getAttribute('aria-label'))).toEqual([
    'Discover',
    'Calendar',
    'Browse',
    'Watchlist',
  ]);
  const more = screen.getByRole('button', { name: 'More' });
  expect(more).toHaveAttribute('aria-controls', 'drawer');
  fireEvent.click(more);
  expect(onMore).toHaveBeenCalledTimes(1);
});

test('signed out there is no More: every public destination is already in the bar', () => {
  renderWithProviders(
    <TabBar
      sections={getNavSections({ user: null, anilistUser: null })}
      moreOpen={false}
      onMore={vi.fn()}
    />,
  );
  expect(screen.queryByRole('button', { name: 'More' })).not.toBeInTheDocument();
  expect(screen.getAllByRole('link')).toHaveLength(4);
});

test('signed in More stays even with an empty drawer, for Settings and Log out', () => {
  renderWithProviders(
    <TabBar
      sections={getNavSections({ user, anilistUser: null })}
      moreOpen={false}
      onMore={vi.fn()}
    />,
  );
  expect(screen.getByRole('button', { name: 'More' })).toBeInTheDocument();
});

test('marks the current route active', () => {
  renderWithProviders(
    <TabBar
      sections={getNavSections({ user: null, anilistUser: null })}
      moreOpen={false}
      onMore={vi.fn()}
    />,
    { route: '/calendar' },
  );
  expect(screen.getByRole('link', { name: 'Calendar' })).toHaveClass('tabBar__item--active');
});
