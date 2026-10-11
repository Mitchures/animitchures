import { screen, fireEvent } from '@testing-library/react';

import Drawer from './Drawer';
import { getNavSections } from './nav-items';
import { renderWithProviders } from 'test-utils';
import { User, AnilistUser } from 'context/types';

const user = { uid: 'u1', displayName: 'Mitchell', photoURL: null, email: 'm@example.com' } as User;
const anilistUser = { id: 1, name: 'mitch' } as unknown as AnilistUser;
const sections = getNavSections({ user, anilistUser });

const setup = (open = true) => {
  const onClose = vi.fn();
  const onLogout = vi.fn();
  const view = renderWithProviders(
    <Drawer open={open} sections={sections} user={user} onClose={onClose} onLogout={onLogout} />,
  );
  return { onClose, onLogout, ...view };
};

afterEach(() => {
  document.body.style.overflow = '';
});

test('renders nothing when closed', () => {
  setup(false);
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
});

test('lists what the bar does not: Favorites, Taste, Social, and the account row', () => {
  setup();
  expect(screen.getByRole('dialog')).toBeInTheDocument();
  for (const name of ['Favorites', 'Taste', 'Social']) {
    expect(screen.getByRole('link', { name })).toBeInTheDocument();
  }
  expect(screen.queryByRole('link', { name: 'Discover' })).not.toBeInTheDocument();
  expect(screen.getByText('Mitchell')).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'Settings' })).toBeInTheDocument();
});

test('Escape and the dim close it', () => {
  const { onClose } = setup();
  fireEvent.keyDown(document, { key: 'Escape' });
  fireEvent.click(screen.getByTestId('drawer-dim'));
  expect(onClose).toHaveBeenCalledTimes(2);
});

test('logout calls onLogout', () => {
  const { onLogout } = setup();
  fireEvent.click(screen.getByRole('button', { name: 'Logout' }));
  expect(onLogout).toHaveBeenCalledTimes(1);
});

test('the account row links to the profile and closes the drawer', () => {
  const { onClose } = setup();
  const row = screen.getByText('Mitchell').closest('a')!;
  expect(row).toHaveAttribute('href', '/profile');
  fireEvent.click(row);
  expect(onClose).toHaveBeenCalledTimes(1);
});

test('locks body scroll while open and restores it on unmount', () => {
  const { unmount } = setup();
  expect(document.body.style.overflow).toBe('hidden');
  unmount();
  expect(document.body.style.overflow).toBe('');
});
