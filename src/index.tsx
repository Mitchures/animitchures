import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ApolloProvider } from '@apollo/client';
import './index.css';
import App from './App';
import { StateProvider, initialState } from './context';
import { apolloClient } from './config';
import { applyPreferences, readCachedPreferences } from 'features/settings/preferences';

// Before the first render: the durable copy lives in Firestore but only
// arrives after auth resolves, and the page would paint light then snap dark.
applyPreferences(readCachedPreferences());

const container = document.getElementById('root');
const root = createRoot(container as Element);
root.render(
  <StrictMode>
    <ApolloProvider client={apolloClient}>
      <StateProvider initialState={initialState}>
        <App />
      </StateProvider>
    </ApolloProvider>
  </StrictMode>,
);
