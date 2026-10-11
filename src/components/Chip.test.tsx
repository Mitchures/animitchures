import { render, screen } from '@testing-library/react';

import Chip from './Chip';

test('defaults to the neutral tone', () => {
  render(<Chip>Tonight</Chip>);
  expect(screen.getByText('Tonight')).toHaveClass('chip', 'chip--neutral');
});

test('lime tone is a class, so its ink text colour comes from CSS not props', () => {
  render(<Chip tone="lime">Airing this week</Chip>);
  expect(screen.getByText('Airing this week')).toHaveClass('chip--lime');
});
