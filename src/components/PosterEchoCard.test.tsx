import { screen } from '@testing-library/react';

import PosterEchoCard from './PosterEchoCard';
import fixture from '../../e2e/fixtures/Featured.json';
import { renderWithProviders } from 'test-utils';
import { Featured } from 'graphql/featured';

const top = (fixture.data as unknown as Featured).top!.media;

test('rank 1 gets the lime chip and the score is a dot number', () => {
  renderWithProviders(<PosterEchoCard media={top[0]} rank={1} />);

  expect(screen.getByText('#1')).toHaveClass('chip--lime');
  expect(screen.getByTestId('dot-number')).toHaveAttribute('aria-label', '91');
});

test('three copies of the poster: two blurred echoes behind one sharp', () => {
  renderWithProviders(<PosterEchoCard media={top[1]} rank={2} />);

  const imgs = document.querySelectorAll('.posterEchoCard__stack img');
  expect(imgs).toHaveLength(3);
  expect(imgs[2]).toHaveClass('is-sharp');
  expect(screen.getByText('#2')).toHaveClass('chip--neutral');
});

test('links to the title', () => {
  renderWithProviders(<PosterEchoCard media={top[0]} rank={1} />);

  expect(screen.getByRole('link')).toHaveAttribute(
    'href',
    expect.stringMatching(/^\/anime\/154587\//),
  );
});
