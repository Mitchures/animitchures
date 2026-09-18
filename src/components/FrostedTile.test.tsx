import { screen } from '@testing-library/react';

import FrostedTile from './FrostedTile';
import { renderWithProviders } from 'test-utils';
import { PALETTES } from 'helpers';

test('renders label, number slot, caption and footer in that order', () => {
  renderWithProviders(
    <FrostedTile
      treatment="blob"
      palette={PALETTES.night}
      label="Tonight"
      caption="episodes from 11:00 pm"
      footer={<i data-testid="foot" />}
    >
      <span>7</span>
    </FrostedTile>,
  );
  const tile = screen.getByText('Tonight').closest('.frostedTile')!;
  expect(tile).toHaveClass('frostedTile--blob');
  const order = [
    ...tile.querySelectorAll(
      '.frostedTile__label, .frostedTile__number, .frostedTile__caption, .frostedTile__footer',
    ),
  ].map((n) => n.className);
  expect(order).toEqual([
    'frostedTile__label',
    'frostedTile__number',
    'frostedTile__caption',
    'frostedTile__footer',
  ]);
});

test('exposes the palette as custom properties for the CSS discs', () => {
  renderWithProviders(
    <FrostedTile treatment="core" palette={{ cap: 'a', body: 'b', accent: 'c' }} label="x">
      <span />
    </FrostedTile>,
  );
  const tile = screen.getByText('x').closest('.frostedTile') as HTMLElement;
  expect(tile.style.getPropertyValue('--cap')).toBe('a');
  expect(tile.style.getPropertyValue('--body')).toBe('b');
  expect(tile.style.getPropertyValue('--accent')).toBe('c');
});

test('renders four disc elements so every treatment has what it needs', () => {
  renderWithProviders(
    <FrostedTile treatment="band" palette={PALETTES.score} label="x">
      <span />
    </FrostedTile>,
  );
  expect(document.querySelectorAll('.frostedTile__disc')).toHaveLength(4);
});

test('links when given a route', () => {
  renderWithProviders(
    <FrostedTile treatment="band" palette={PALETTES.score} label="Top rated" to="/anime/1/x">
      <span />
    </FrostedTile>,
  );
  expect(screen.getByRole('link')).toHaveAttribute('href', '/anime/1/x');
});
