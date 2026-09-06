# CLAUDE.md

Guidance for working in this repo.

## What this is

**Animitchures** — a personal anime-tracking web app. Browse/search anime from the
[AniList GraphQL API](https://github.com/AniList/ApiV2-GraphQL-Docs), keep a local list of
favorites in Firestore, and optionally link an AniList account (OAuth) to read your AniList
watchlist and write list-status updates back.

Vite + TypeScript 6, React 19, Apollo Client 3, Firebase v12 (Auth, Firestore, Cloud
Functions), deployed to Firebase Hosting. Migrated off Create React App on 2026-09-05 — `react-scripts`
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
  index.tsx          React 19 createRoot; wraps App in ApolloProvider + StateProvider
  vite-env.d.ts      /// <reference types="vite/client" /> — types the asset imports
  test-utils.tsx     renderWithProviders() — RTL render wrapped in the app's providers
  api/services/      Firestore reads/writes: favorites.ts, profile.ts, anilist.ts (tokens)
  components/        Shared UI; components/details/* are Details-page sections
                     Skeleton.tsx is a shimmer primitive (Details skeleton + spotlight)
                     SearchSpotlight.tsx is global search; Hero/AiringThisWeek/Rail/
                     GenreTiles are the Discover sections; CastChip is one cast credit
  config/            firebase.ts (app, auth, db, storage, Apple/Google providers), apollo-client.ts
  context/           useReducer-based global store (StateProvider, reducer, types, initialState)
                     ScrollContainer.tsx shares the scrolling element (see "Scrolling" below)
  graphql/           queries.ts, mutations.ts (handwritten), types.ts (GENERATED — don't edit)
  helpers/           authHeader() (AniList token), mediaPath() (the /anime/:id/:slug rule,
                     shared so Card and the spotlight cannot produce two URLs for one
                     title), scoreTier() (score severity buckets)
  utils/hooks/       useInput, useTilt (pointer tilt — pair with a perspective wrapper)
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

**Shell chrome.** `Navigation` is a 72px icon rail that expands to 240px on hover. It is
absolutely positioned and `.app__body` reserves its width with a margin, so expanding it
overlays the page instead of shifting it. Account controls — notifications, settings,
profile, logout — sit in `.navigation__footer` at the bottom, and search sits at the top
above the "Menu" heading.

**There is no desktop header.** `--header-height` is `0px` above 960px, which is what
drives the Details banner pull-up, the sticky tab bar's offset and every
`calc(100vh - var(--header-height))` view height from one token. `.header` is
`display: none` there. Below 960px the rail is hidden, `--header-height` becomes 72px and
the header returns — it still carries the logo and the `MobileMenu` button, plus its own
inline `Search`.

**Search.** `SearchSpotlight` is an overlay opened from the rail, or with ⌘K / `/`;
escape closes, arrows move, enter opens, and focus returns to the trigger. It is
controlled — `AppShell` owns the open state, because the trigger lives in `Navigation`.
Results are gated on the current term: Apollo keeps the last response, so without that the
previous search's posters are still there on reopen. Desktop only.

**Discover.** A full-bleed `Hero` (crossfading slides, the active slide's poster, a
sideways scrim, score tier badge, CTAs), `AiringThisWeek`, the `Rail` rows, then
`GenreTiles`. Everything is built from the one `Featured` query — `nextAiringEpisode`,
`duration` and `genres` all come back with it, so no section costs an extra request. An
airing card retires itself once the episode's own runtime has elapsed (capped at 90
minutes, defaulting to 24), fading out while the rest reflow and the next one backfills.
Genre tiles link to `/search/anime?genre=`, which `Results` handles alongside `?search=` —
it falls back to `POPULARITY_DESC` there, since `SEARCH_MATCH` ranks by typed text.

**Scrolling.** The window never scrolls: `.app__body` is a fixed-height `overflow-y: auto`
box. So `useScroll()` from framer-motion silently produces zeros, and window scroll
listeners never fire. `AppShell` publishes that element through `ScrollContainerProvider`;
read it with `useScrollContainer()` and drive a `MotionValue` from its `scrollTop`
(`Details.tsx` is the worked example). `useInView` is unaffected — IntersectionObserver
still resolves against the viewport.

**Details page.** A hero over the banner (poster, title, alternative titles, genres, four
stat chips, actions) followed by tabs: Overview, Characters, Staff, Relations. The active
tab lives in `?tab=`, written with `replace` so switching tabs does not stack history;
an unknown value falls back to Overview. Tabs are only rendered when they have content —
Relations is gated on the ANIME filter it applies internally, not on `edges.length`.
The banner image is its own layer, extended 200px above the banner so its parallax
translation (max 165px) never exposes an edge. Every effect is off under
`prefers-reduced-motion`. `DetailsSkeleton` deliberately avoids the real `details__*`
class names — the e2e suite waits on `.details__hero` to know data arrived.

**Routing.** All routes except `/login` and `/sign-up` render inside a Navigation + Header shell.
Private routes are rendered conditionally on `user` in the route tree, with `*` → `<Navigate to="/" />`.

## Current state — what's done and what isn't

Working: Discover (cinematic hero, live airing countdowns, snapping rails, genre tiles),
spotlight search with live poster results, details page (hero + tabs, parallax, skeleton
loading, rankings/tags/links/community stats/recommendations), favorites, Firebase auth
(email+password, Google, Apple), settings, AniList linking, AniList watchlist view.
Responsive down to 320px.

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
- **`firestore.rules` allows any signed-in user to read/write any document** — including
  other users' AniList access tokens. A hardened per-uid version exists in the working
  copy but `.gitignore` excludes `firestore*`, so it is in no commit and has never been
  deployed. `firebase deploy --only firestore:rules` applies it.
- **The login backgrounds still ship in the bundle:** `src/images/maiden.jpg` is 5.4MB and
  `usagi.jpeg` is 1.1MB.
- **MUI is fully on v9** as of 2026-09-05; `@material-ui` v4 is gone. Note MUI requires
  `@emotion/*` at 11.14+ — 11.8 satisfies the peer range on paper but throws
  `emStyled is not a function` at runtime under vitest.
- **`@emotion/react` and `@emotion/styled` look unused but must stay** — MUI requires them
  as peer dependencies. Styling is otherwise plain CSS files.
- **`@apollo/client` is deliberately held at 3.6.** A v4 upgrade was attempted on
  2026-09-05 and reverted. v4 needs `rxjs` as a new peer, moves hooks to
  `@apollo/client/react` and `MockedProvider` to `@apollo/client/testing/react`, changes
  the `onError` callback to a single `error` argument, and moves `useLazyQuery` variables
  to the execute call. The blocker was typing: v4 returns `data` as `{}` rather than `any`,
  so every call site needs a generic — and AniList's generated types are fully `Maybe<>`
  wrapped, which cascades null-handling changes into Favorites, Profile, AnilistWatchlist
  and Results. Three of those need sign-in to exercise, so the changes could not be
  verified. **That blocker is gone** — the signed-in e2e coverage added on 2026-09-05 is
  exactly the way to test those views, so this is now unblocked and is the largest
  outstanding upgrade.
- **`graphql` is still on 16.3** (17.0.2 is out) and needs the codegen packages moved with
  it.
- **`typescript` must stay below 6.1.** `typescript-eslint` declares
  `typescript: ">=4.8.4 <6.1.0"`, so TypeScript 7 would break `yarn lint`.
- **`@types/react` is pinned via `resolutions`** in `package.json`. MUI drags in
  `@types/react-is` and `@types/react-transition-group`, which pin `@types/react` 18; two
  copies produce `TS2786: cannot be used as a JSX component` on every icon.
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
- **`yarn e2e` never touches the live AniList API.** Every request is answered from a
  captured fixture in `e2e/fixtures/`; an unmatched operation throws rather than falling
  through to the network. Verified by probing `x-ratelimit-remaining` around a full run.
  `yarn e2e:live` is the opt-in drift check that does hit the real API — run it after any
  AniList-facing change, or when a real bug appears the suite did not catch. Fixture drift
  is now the main residual testing risk.
- **The `authed` project runs serially with one local retry** (`fullyParallel: false`,
  `retries: 1`). Those specs share one real Firebase account and each waits on Auth plus a
  Firestore read; five in parallel timed out waiting for the signed-in shell. Every other
  project is fixture-mocked and stays parallel, so a retry consumed there is worth looking
  at rather than ignoring.
- **Navigate with `waitUntil: 'domcontentloaded'`.** Only GraphQL is mocked — poster images
  still come from AniList's CDN, and Playwright's default `load` waits for every one.
- **Four Playwright projects.** `setup` signs in once and saves `e2e/.auth/user.json`;
  `public` holds the signed-out specs and must never be given a storageState (they assert
  signed-out behaviour); `authed` reuses the saved session; `live` is excluded from default
  runs by the `@live` tag, since Playwright otherwise runs every project.
- **Signed-in testing needs two local files, both gitignored.** `.env.test.local` holds
  real credentials for a Firebase test account that exists in the production project, and
  `e2e/.auth/` holds its saved session. A fresh clone has neither. Recreate with
  `yarn e2e:seed` after putting credentials in place.
- **Private routes cannot be reached with `page.goto()`.** `user` is null on first render,
  so the `*` catch-all redirects to `/`. Navigate by clicking sidebar or overlay links.
  `e2e/authed/signed-in.spec.ts` documents this with a `test.fail()` that will start
  complaining when the bug is fixed.
- `src/graphql/types.ts` is generated — change `codegen.yml` and rerun `yarn generate` instead of
  editing it.
