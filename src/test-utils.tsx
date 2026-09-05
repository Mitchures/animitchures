import { ReactElement } from 'react';
import { render, RenderResult } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { MockedProvider } from '@apollo/client/testing';

import { StateProvider, initialState } from 'context';
import { State } from 'context/types';

interface Options {
  route?: string;
  state?: Partial<State>;
}

/**
 * Renders `ui` inside the same providers `index.tsx` supplies at runtime.
 * Bare RTL `render` cannot be used in this codebase: `useStateValue()`
 * destructures a tuple, and the context default is `{}`.
 */
export function renderWithProviders(
  ui: ReactElement,
  { route = '/', state = {} }: Options = {},
): RenderResult {
  return render(
    <MockedProvider mocks={[]} addTypename={false}>
      <StateProvider initialState={{ ...initialState, ...state }}>
        <MemoryRouter initialEntries={[route]}>{ui}</MemoryRouter>
      </StateProvider>
    </MockedProvider>,
  );
}
