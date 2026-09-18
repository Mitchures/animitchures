import { screen, act } from '@testing-library/react';

import SlideHero from './SlideHero';
import fixture from '../../../e2e/fixtures/Featured.json';
import { renderWithProviders } from 'test-utils';
import { Featured } from 'graphql/featured';

const trending = (fixture.data as unknown as Featured).trending!.media.slice(0, 5);

beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

test('shows the first trending title with its score and a details link', () => {
  renderWithProviders(<SlideHero media={trending} />);

  expect(screen.getByRole('heading', { name: /Slime Season 4/ })).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'View details' })).toHaveAttribute(
    'href',
    expect.stringMatching(/^\/anime\/182205\//),
  );
  expect(screen.getByTestId('dot-number')).toHaveAttribute('aria-label', '83');
});

test('advances to the next slide after seven seconds', () => {
  renderWithProviders(<SlideHero media={trending} />);

  act(() => vi.advanceTimersByTime(7400));

  // The page bar, not the heading: the copy sits inside an AnimatePresence in
  // `mode="wait"`, whose exit animation never completes under fake timers, so
  // the outgoing title is still mounted here. The bar is outside it and is the
  // honest signal that the rotation moved.
  expect(document.querySelectorAll('.slideHero__page')[1]).toHaveClass('is-on');
  expect(screen.getAllByRole('tab')[1]).toHaveAttribute('aria-selected', 'true');
});

test('one page bar per slide, each naming its title for screen readers', () => {
  renderWithProviders(<SlideHero media={trending} />);

  const pages = screen.getAllByRole('tab');
  expect(pages).toHaveLength(5);
  expect(pages[0]).toHaveAttribute('aria-selected', 'true');
  expect(pages[1]).toHaveAttribute('aria-label', 'ONE PIECE');
});
