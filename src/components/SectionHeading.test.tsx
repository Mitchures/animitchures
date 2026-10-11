import { screen } from '@testing-library/react';

import SectionHeading from './SectionHeading';
import Button from './Button';
import { renderWithProviders } from 'test-utils';

test('renders title, detail and a right-aligned action', () => {
  renderWithProviders(
    <SectionHeading
      title="Airing this week"
      detail="In the order it airs."
      action={<Button to="/calendar">See all</Button>}
    />,
  );
  expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Airing this week');
  expect(screen.getByText('In the order it airs.')).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'See all' })).toHaveAttribute('href', '/calendar');
});
