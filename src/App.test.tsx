import { render, screen } from '@testing-library/react';
import App from './App';

test('renders header image', () => {
  render(<App />);
  const imgElement = screen.getByAltText(/animitchure/i);
  expect(imgElement).toBeInTheDocument();
});
