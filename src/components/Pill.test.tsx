import { screen, fireEvent } from '@testing-library/react';

import Pill from './Pill';
import { renderWithProviders } from 'test-utils';

test('renders a link with the label as accessible name when given a route', () => {
  renderWithProviders(<Pill label="Calendar" to="/calendar" tail="14 this week" />);
  const link = screen.getByRole('link', { name: 'Calendar' });
  expect(link).toHaveAttribute('href', '/calendar');
  expect(screen.getByText('14 this week')).toHaveClass('pill__tail');
});

test('marks the pill active on its own route', () => {
  renderWithProviders(<Pill label="Calendar" to="/calendar" />, { route: '/calendar' });
  expect(screen.getByRole('link', { name: 'Calendar' })).toHaveClass('pill--active');
});

test('renders a button when there is no route', () => {
  const onClick = vi.fn();
  renderWithProviders(<Pill label="Log out" onClick={onClick} />);
  fireEvent.click(screen.getByRole('button', { name: 'Log out' }));
  expect(onClick).toHaveBeenCalledTimes(1);
});

test('lime tail carries the lime tone class', () => {
  renderWithProviders(<Pill label="Watchlist" to="/w" tail="2 new" tailTone="lime" />);
  expect(screen.getByText('2 new')).toHaveClass('pill__tail--lime');
});
