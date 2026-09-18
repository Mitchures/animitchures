import { screen, fireEvent } from '@testing-library/react';

import ThemeToggle from './ThemeToggle';
import { DEFAULT_PREFERENCES, preferencesVar } from './preferences';
import { renderWithProviders } from 'test-utils';

afterEach(() => {
  document.documentElement.removeAttribute('data-theme');
  preferencesVar(DEFAULT_PREFERENCES);
  localStorage.clear();
});

test('defaults to System, so nothing is stamped on the document', () => {
  renderWithProviders(<ThemeToggle />);

  expect(document.documentElement.getAttribute('data-theme')).toBeNull();
  // jsdom has no matchMedia, so the system reads as light and the button offers dark.
  expect(screen.getByRole('button', { name: 'Switch to dark theme' })).toBeInTheDocument();
});

test('flips both ways, relabelling each time', () => {
  renderWithProviders(<ThemeToggle />);

  fireEvent.click(screen.getByRole('button', { name: 'Switch to dark theme' }));
  expect(document.documentElement.getAttribute('data-theme')).toBe('dark');

  // The label has to follow, or a second press sends the same value again —
  // which it did until `preferencesVar` made the preference reactive.
  fireEvent.click(screen.getByRole('button', { name: 'Switch to light theme' }));
  expect(document.documentElement.getAttribute('data-theme')).toBe('light');
});

test('from System it flips away from what the OS is doing', () => {
  // The stored value is System; the decision comes from what is on screen.
  preferencesVar({ ...DEFAULT_PREFERENCES, theme: 'system' });
  renderWithProviders(<ThemeToggle />);

  fireEvent.click(screen.getByRole('button', { name: /Switch to/ }));

  expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
});
