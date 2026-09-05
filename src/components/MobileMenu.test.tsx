import { screen, fireEvent } from '@testing-library/react';

import MobileMenu from './MobileMenu';
import { getNavSections } from './nav-items';
import { renderWithProviders } from 'test-utils';
import { User } from 'context/types';

const user = { uid: 'u1', displayName: 'Mitchell', photoURL: null, email: 'm@example.com' } as User;
const sections = getNavSections({ user, anilistUser: null });

const setup = (open = true) => {
  const onClose = vi.fn();
  const onLogout = vi.fn();
  const view = renderWithProviders(
    <MobileMenu open={open} sections={sections} user={user} onClose={onClose} onLogout={onLogout} />,
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

test('renders every nav item when open', () => {
  setup();
  expect(screen.getByRole('dialog')).toBeInTheDocument();
  expect(screen.getByText('Discover')).toBeInTheDocument();
  expect(screen.getByText('Favorites')).toBeInTheDocument();
  expect(screen.getByText('Settings')).toBeInTheDocument();
  expect(screen.getByText('Logout')).toBeInTheDocument();
});

test('close button calls onClose', () => {
  const { onClose } = setup();
  fireEvent.click(screen.getByRole('button', { name: /close menu/i }));
  expect(onClose).toHaveBeenCalledTimes(1);
});

test('Escape calls onClose', () => {
  const { onClose } = setup();
  fireEvent.keyDown(document, { key: 'Escape' });
  expect(onClose).toHaveBeenCalledTimes(1);
});

test('logout calls onLogout', () => {
  const { onLogout } = setup();
  fireEvent.click(screen.getByText('Logout'));
  expect(onLogout).toHaveBeenCalledTimes(1);
});

test('shows who is signed in', () => {
  setup();
  expect(screen.getByText(/Mitchell/)).toBeInTheDocument();
});

test('locks body scroll while open and restores it on unmount', () => {
  const { unmount } = setup();
  expect(document.body.style.overflow).toBe('hidden');

  unmount();
  expect(document.body.style.overflow).toBe('');
});
