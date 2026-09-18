import { screen } from '@testing-library/react';

import Discover from './Discover';
import fixture from '../../../e2e/fixtures/Featured.json';
import { renderWithProviders } from 'test-utils';
import { Featured } from 'graphql/featured';
import { User } from 'context/types';

const featured = fixture.data as unknown as Featured;
const user = { uid: 'u1', displayName: 'Mitchell', photoURL: null, email: 'm@example.com' } as User;

beforeEach(() => {
  vi.useFakeTimers();
  // The instant the fixture was captured, so every derived figure is fixed.
  vi.setSystemTime(new Date(1788603464 * 1000));
});
afterEach(() => vi.useRealTimers());

test('signed in: four stats, slide, three widgets, airing and top rated', () => {
  renderWithProviders(<Discover />, { state: { featured, user, favorites: [189046] } });

  // The stat row opens the page — there is no greeting heading any more.
  expect(screen.queryByRole('heading', { level: 1 })).not.toBeInTheDocument();
  expect(screen.getByText('Airing this week', { selector: '.chip' })).toBeInTheDocument();
  expect(screen.getByText('Favorites', { selector: '.chip' })).toBeInTheDocument();
  expect(document.querySelector('.slideHero')).toBeInTheDocument();
  // Scoped to the widget row: the page carries other frosted tiles now, and a
  // bare count would break every time a section is added.
  expect(document.querySelectorAll('.discover__widgets .frostedTile')).toHaveLength(3);
  expect(document.querySelectorAll('.linkTile')).toHaveLength(1);
  expect(document.querySelectorAll('.episodeCard')).toHaveLength(4);
  expect(document.querySelectorAll('.posterEchoCard')).toHaveLength(4);
  expect(
    screen.getByText('Re:ZERO -Starting Life in Another World- Season 4', {
      selector: '.infoCard__title',
    }),
  ).toBeInTheDocument();
});

test('the figures match the fixture: 14 this week, 2 tonight, top score 91', () => {
  renderWithProviders(<Discover />, { state: { featured, user, favorites: [] } });

  const stats = [...document.querySelectorAll('.statRow__stat')].map((stat) => [
    stat.querySelector('.dotNumber')?.getAttribute('aria-label'),
    stat.querySelector('.chip')?.textContent,
  ]);
  expect(stats).toEqual([
    ['14', 'Airing this week'],
    ['2', 'Tonight'],
    ['0', 'Favorites'],
    ['91', 'Top score'],
  ]);
});

test('signed out: no Favorites stat, no link tile, season card instead', () => {
  renderWithProviders(<Discover />, { state: { featured, user: null, favorites: [] } });

  expect(screen.queryByText('Favorites', { selector: '.chip' })).not.toBeInTheDocument();
  expect(document.querySelectorAll('.discover__widgets .frostedTile')).toHaveLength(3);
  expect(document.querySelectorAll('.linkTile')).toHaveLength(0);
  expect(screen.getByText('Fall 2026', { selector: '.infoCard__title' })).toBeInTheDocument();
});

test('genre tiles close the page, each linking into Browse', () => {
  renderWithProviders(<Discover />, { state: { featured, user, favorites: [] } });

  const tiles = [...document.querySelectorAll('.genreTiles .frostedTile')];
  expect(tiles).toHaveLength(8);
  expect(tiles[0]).toHaveAttribute('href', '/search/anime?genre=Action');
  // The small variant, so the discs scale down with the tile.
  expect(tiles[0]).toHaveClass('frostedTile--sm');
  // Action is band, Drama blob, Fantasy core — the assigned identity, so no two
  // of the first three share a treatment.
  expect(tiles[0]).toHaveClass('frostedTile--band');
  expect(tiles[1]).toHaveClass('frostedTile--blob');
  expect(tiles[2]).toHaveClass('frostedTile--core');
});

test('renders the skeleton until featured arrives', () => {
  renderWithProviders(<Discover />, { state: { featured: null } });

  expect(document.querySelector('.discoverSkeleton')).toBeInTheDocument();
  expect(document.querySelector('.slideHero')).not.toBeInTheDocument();
});
