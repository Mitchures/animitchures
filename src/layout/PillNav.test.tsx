import { screen, fireEvent } from '@testing-library/react';

import PillNav from './PillNav';
import { getNavSections } from './nav-items';
import { renderWithProviders } from 'test-utils';
import { User, AnilistUser } from 'context/types';

const user = { uid: 'u1', displayName: 'Mitchell', photoURL: null, email: 'm@example.com' } as User;
const anilistUser = { id: 1, name: 'mitch' } as unknown as AnilistUser;

test('renders Explore and Library tabs and every destination as a link', () => {
  renderWithProviders(
    <PillNav sections={getNavSections({ user, anilistUser })} user={user} onLogout={vi.fn()} />,
  );
  expect(screen.getByRole('tab', { name: 'Explore' })).toBeInTheDocument();
  expect(screen.getByRole('tab', { name: 'Library' })).toBeInTheDocument();
  for (const name of ['Discover', 'Calendar', 'Browse', 'Favorites']) {
    expect(screen.getByRole('link', { name })).toBeInTheDocument();
  }
});

test('switching to Library shows only library items', () => {
  renderWithProviders(
    <PillNav sections={getNavSections({ user, anilistUser })} user={user} onLogout={vi.fn()} />,
  );
  fireEvent.click(screen.getByRole('tab', { name: 'Library' }));
  expect(screen.queryByRole('link', { name: 'Calendar' })).not.toBeInTheDocument();
  for (const name of ['Watchlist', 'Taste', 'Social']) {
    expect(screen.getByRole('link', { name })).toBeInTheDocument();
  }
});

test('account row shows the user, settings and logout', () => {
  const onLogout = vi.fn();
  renderWithProviders(
    <PillNav sections={getNavSections({ user, anilistUser: null })} user={user} onLogout={onLogout} />,
  );
  expect(screen.getByText('Mitchell')).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'Settings' })).toHaveAttribute('href', '/settings');
  fireEvent.click(screen.getByRole('button', { name: 'Logout' }));
  expect(onLogout).toHaveBeenCalledTimes(1);
});

test('signed out: a Login pill instead of the account row, and no Library tab', () => {
  renderWithProviders(
    <PillNav sections={getNavSections({ user: null, anilistUser: null })} user={null} onLogout={vi.fn()} />,
  );
  expect(screen.getByRole('link', { name: 'Login' })).toBeInTheDocument();
  expect(screen.queryByRole('tab', { name: 'Library' })).not.toBeInTheDocument();
  expect(screen.queryByRole('link', { name: 'Settings' })).not.toBeInTheDocument();
});
