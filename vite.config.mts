/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => ({
  // @apollo/client v3's ESM build references a bare `__DEV__` global, which
  // CRA's webpack defined for it. Without this the app throws
  // "__DEV__ is not defined" at import time and React never mounts.
  define: {
    __DEV__: JSON.stringify(mode !== 'production'),
  },
  plugins: [react()],
  resolve: {
    // Honours `baseUrl: ./src` from tsconfig.json, so absolute imports like
    // `components/Loader` resolve. Vite 8 does this natively; the
    // vite-tsconfig-paths plugin is no longer needed.
    tsconfigPaths: true,
  },
  server: {
    // Must stay 3000: playwright.config.ts hardcodes this baseURL.
    port: 3000,
    strictPort: true,
  },
  build: {
    // Must stay 'build', not Vite's default 'dist': firebase.json sets
    // hosting.public to 'build' and is gitignored, so a copy of this repo on
    // another machine would break silently.
    outDir: 'build',
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.ts',
    css: false,
    // Scoped to src, matching what CRA's jest did. Vitest's default globs the
    // whole project root, which picks up Playwright specs in e2e/ and the
    // source-tree snapshots under .superpowers/.
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
  },
}));
