# CLAUDE.md

Guidance for working in this repo.

## What this is

**Animitchures** — a personal anime-tracking web app. Browse/search anime from the
[AniList GraphQL API](https://github.com/AniList/ApiV2-GraphQL-Docs), keep a local list of
favorites in Firestore, and optionally link an AniList account (OAuth) to read your AniList
watchlist and write list-status updates back.

Vite + TypeScript, React 18, Apollo Client, Firebase v9 (Auth, Firestore, Cloud Functions),
deployed to Firebase Hosting. Migrated off Create React App on 2026-09-05 — `react-scripts`
had been unmaintained since 2022.

## Commands

```bash
yarn start      # Vite dev server on :3000
yarn build      # tsc --noEmit && vite build -> build/ (what Firebase Hosting serves)
yarn preview    # serve the production build on :3000
yarn test       # vitest run (unit, jsdom + RTL)
yarn test:watch # vitest in watch mode
yarn lint       # eslint over src and e2e (flat config in eslint.config.mjs)
yarn e2e        # playwright: responsive/navigation suite against :3000
yarn e2e:install # one-time: download the chromium binary Playwright needs
yarn generate   # graphql-codegen: regenerates src/graphql/types.ts from the AniList schema
```

`build.outDir` is deliberately `build`, not Vite's default `dist`, because `firebase.json`
sets `hosting.public` to `build`. Don't change one without the other.

Cloud Functions live in `functions/` with their own `package.json`
(`npm --prefix functions run build`, `firebase deploy --only functions`).

Verified on Node v24 / yarn 1.22 as of 2026-09-05: 12 unit tests pass (1 skipped), 17 e2e
tests pass against both the dev server and the production build, `yarn lint` exits 0 with
53 pre-existing warnings.

### AniList OAuth is proxied by the dev server

`src/views/Callback.tsx` POSTs the authorization code to `/anilist/token`, which
`server.proxy` in `vite.config.mts` forwards to `https://anilist.co/api/v2/oauth/token`.
AniList's token endpoint sends no CORS headers, so the browser can't call it directly.

No separate process is needed — the old `npx local-cors-proxy` step is gone. This is
**dev-only**: a production build has nothing proxying that path, so account linking only
works locally. Fixing that properly means moving the token exchange into a Cloud Function,
which would also stop shipping the client secret to the browser.

## Environment

`.env.local` (gitignored, present locally) holds Vite-prefixed vars. Vite only exposes vars
beginning `VITE_`, and inlines them into the bundle at build time — there is no runtime env
on Firebase Hosting to configure.

- `VITE_API_KEY`, `VITE_AUTH_DOMAIN`, `VITE_PROJECT_ID`, `VITE_STORAGE_BUCKET`, `VITE_MESSAGING_SENDER_ID`, `VITE_APP_ID` — Firebase
- `VITE_ANILIST_CLIENT_ID`, `VITE_ANILIST_CLIENT_SECRET`, `VITE_ANILIST_CALLBACK_URI` — AniList OAuth

Read them via `import.meta.env.VITE_*`, never `process.env`. `.env.test` holds fake values
so tests are deterministic; Vite's precedence puts it above `.env.local` in test mode.

Note: `.gitignore` also excludes `firebase.json`, `.firebaserc`, `firestore*`, and `storage.rules`,
even though those files exist locally.

## Layout

```
index.html           Vite entry point — lives at the project ROOT, not in public/
vite.config.mts      dev server (:3000), build.outDir, vitest config, AniList proxy
eslint.config.mjs    flat config; replaced the eslintConfig block in package.json
playwright.config.ts e2e config; baseURL is hardcoded to http://localhost:3000
e2e/                 Playwright specs (.spec.ts) — outside src so vitest ignores them
public/              static files copied verbatim: favicon, manifest, logos, robots.txt
src/
  App.tsx            Router + the auth-state listener that hydrates global state on login
  index.tsx          React 18 createRoot; wraps App in ApolloProvider + StateProvider
  vite-env.d.ts      /// <reference types="vite/client" /> — types the asset imports
  test-utils.tsx     renderWithProviders() — RTL render wrapped in the app's providers
  api/services/      Firestore reads/writes: favorites.ts, profile.ts, anilist.ts (tokens)
  components/        Shared UI; components/details/* are Details-page sections
  config/            firebase.ts (app, auth, db, storage, Apple/Google providers), apollo-client.ts
  context/           useReducer-based global store (StateProvider, reducer, types, initialState)
  graphql/           queries.ts, mutations.ts (handwritten), types.ts (GENERATED — don't edit)
  helpers/           authHeader() — reads the AniList token from localStorage
  utils/hooks/       useInput
  views/             Route-level pages, each with a sibling .css
functions/src/       Firebase Cloud Functions (auth + Firestore triggers)
```

`tsconfig.json` sets `baseUrl: ./src`, so imports are absolute from `src`:
`import Loader from 'components/Loader'`, not relative paths. Follow that convention.

## Architecture notes

**State.** One global store via `useReducer` + context (`useStateValue()` returns `[state, dispatch]`).
State: `user`, `anilist_user`, `favorites` (array of AniList media ids), `featured`, `results`.
The reducer `console.log`s every action — that's intentional debug noise, not a bug.

**Auth / data flow.** `App.tsx`'s `onAuthStateChanged` effect is the app's spine: on login it
reads/creates the `users/{uid}` doc, loads favorites, and — if `anilistLinked` — pulls the stored
access token into `localStorage` and the AniList profile into state. On logout it clears state and
the token.

**Two data sources, kept separate.**
- AniList (Apollo, `https://graphql.anilist.co`) — all media data. Authenticated calls pass
  `context: { headers: authHeader() }` per-operation; the token is *not* in the Apollo link chain.
- Firestore — user profile, favorites, tokens, cached AniList profile.

**Firestore collections** (all keyed by Firebase `uid`): `users`, `favorites` (`{ favorites: number[] }`),
`anilist` (cached AniList Viewer), `tokens` (AniList access token).

**Cloud Functions** (`functions/src/index.ts`): `createProfile` and `createFavorites` seed docs on
user creation; `linkedAnilistAccount` flips `users/{uid}.anilistLinked` when an `anilist/{uid}` doc
appears.

**Routing.** All routes except `/login` and `/sign-up` render inside a Navigation + Header shell.
Private routes are rendered conditionally on `user` in the route tree, with `*` → `<Navigate to="/" />`.

## Current state — what's done and what isn't

Working: discover/featured page, search, details page, favorites, Firebase auth
(email+password, Google, Apple), settings, AniList linking, AniList watchlist view.

Unfinished or parked — mostly deliberate, don't "fix" without asking:
- `views/ComingSoon.tsx` and `views/Community.tsx` are one-line stubs. Their links now live
  in `components/nav-items.ts` rather than commented-out JSX — add an entry there and they
  appear in both the sidebar and the mobile overlay.
- `components/ActivityMap.tsx` was deleted on 2026-09-05. It was the only `styled-components`
  consumer and was already commented out of `Profile.tsx`, so it could not survive that
  dependency's removal. Recoverable from git history.
- The "Preferred Watchlist" `Select` in `Settings.tsx` is commented out (`TODO: maybe`).
  `WatchlistFormat` / `preferredWatchlist` exist in the types but are unused.
- `views/Results.tsx` carries `// TODO: search logic still needs fixing` — pagination merges
  results into global state and "Load more" relies on `refetch()`; it's fragile.
- `SplitButton` writes AniList list status but doesn't reflect server state back.
- `App.test.tsx` is the CRA default smoke test and is `test.skip`ped. It has never passed
  since the global store landed: it renders `<App />` with no providers, but `App` destructures
  a tuple from `useStateValue()` while `StateProvider` defaults the context to `{}`. Whoever
  repairs it must also switch to `getAllByAltText` — the mobile header adds a second
  `alt="animitchures"` logo, and `getByAltText` throws on multiple matches.

Known rough edges worth knowing before touching related code:
- **Private routes vs. auth timing.** `user` is null on first render, so a hard refresh on
  `/favorites` (or any private route) hits the `*` catch-all and redirects to `/`. There's no
  "auth still resolving" state.
- **AniList client secret ships to the browser** via `VITE_*`. Vite inlines every `VITE_`
  var into the bundle at build time. Fine for a personal project; a real fix means moving the
  token exchange into a Cloud Function, which would also make OAuth work in production rather
  than dev only.
- **`firestore.rules` allows any signed-in user to read/write any document.**
- **MUI migration is half-done**: `@material-ui/core` v4 (`Avatar` in `Header.tsx`, `Profile.tsx`)
  and `@mui/material` v5 coexist. New code should use `@mui/*`.
- **`@emotion/react` and `@emotion/styled` look unused but must stay** — MUI v5 requires them
  as peer dependencies. Styling is otherwise plain CSS files.
- **`yarn lint` reports 53 pre-existing warnings and exits 0.** Severities are tuned in
  `eslint.config.mjs` to match what CRA's `react-app` preset reported, so this is the same debt
  that was always there — not a new gate. Note Vite does **not** lint during `build`, unlike CRA.
- **`src/images/maiden.jpg` is 5.4 MB and `usagi.jpeg` is 1.1 MB**, used as the Login and SignUp
  backgrounds. Both ship in the bundle.
- `api/services/favorites.ts` destructures `{ favorites }` from a possibly-`undefined` resolution,
  which throws if the doc is missing.
- The main JS chunk is ~1 MB raw / ~343 kB gzipped, and Vite warns about it on every build.
  No code splitting is set up; every route is in the one bundle.

## Conventions

- Prettier: single quotes, semicolons, trailing commas, 100-char width.
- Styling is plain CSS, one `.css` file per component/view, BEM-ish
  (`.features`, `.features__header`).
- Page transitions use `framer-motion` (`initial`/`animate`/`exit` opacity) at the view root.
- Unit tests are `src/**/*.test.{ts,tsx}` and run under vitest with `globals: true` — use
  `vi.fn()`, not `jest.fn()`, and render via `renderWithProviders` from `test-utils`.
  Playwright specs are `e2e/*.spec.ts`; vitest is scoped to `src` so it never picks them up.
- **`yarn e2e` hits the live AniList API, which allows 30 requests/minute.** One run makes
  roughly 17 page loads, so running the suite two or three times in quick succession will
  trip the limit. AniList's 429 response carries no CORS header, so the browser reports it as
  `blocked by CORS policy` — misleading, and not a bug in the app. Check with
  `curl -sD- -o/dev/null -XPOST https://graphql.anilist.co -H 'Content-Type: application/json' -d '{"query":"{Media(id:1){id}}"}' | grep -i ratelimit`
  before debugging a failure. Tests that only assert layout use `gotoShell()`, which skips
  the API entirely; reserve `gotoDiscover()` for assertions that need real media.
- `src/graphql/types.ts` is generated — change `codegen.yml` and rerun `yarn generate` instead of
  editing it.
