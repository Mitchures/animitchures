import { render, screen, act } from '@testing-library/react';
import DotNumber from './DotNumber';

beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

test('renders the final value immediately when arrival is off', () => {
  render(<DotNumber value={91} arrive="none" />);
  expect(screen.getByText('91')).toBeInTheDocument();
});

test('settles to the final value within 480ms', () => {
  render(<DotNumber value={1177} />);
  act(() => vi.advanceTimersByTime(600));
  expect(screen.getByText('1177')).toBeInTheDocument();
});

test('keeps the digit count while settling so the layout does not jump', () => {
  render(<DotNumber value={91} />);
  act(() => vi.advanceTimersByTime(50));
  const text = screen.getByTestId('dot-number').textContent ?? '';
  expect(text).toHaveLength(2);
});

test('exposes the real value to assistive tech, not the flicker', () => {
  render(<DotNumber value={91} />);
  expect(screen.getByTestId('dot-number')).toHaveAttribute('aria-label', '91');
});

test('skips the flicker under reduced motion', () => {
  document.documentElement.setAttribute('data-motion', 'reduced');
  render(<DotNumber value={27} />);
  expect(screen.getByText('27')).toBeInTheDocument();
  document.documentElement.removeAttribute('data-motion');
});
