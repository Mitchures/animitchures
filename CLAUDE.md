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

Verified on Node v24 / yarn 1.22 as of 2026-09-12: `yarn lint` exits 0 with 20 pre-existing
warnings, and 58 e2e tests pass in the `public` project. Unit: 24 tests, of which **3 fail
and 1 is skipped** — see "Current state" below; both are known and pre-existing, so a red
`yarn test` is not something you broke.

### AniList OAuth runs through a Cloud Function

`src/views/Callback.tsx` calls the `exchangeAnilistCode` callable, which swaps the
authorization code for an access token using the client secret and returns the token.
Two things made this necessary: the secret cannot live in the browser (Vite inlines every
`VITE_` var into the bundle), and AniList's token endpoint sends no CORS headers, so the
browser could never call it directly. The dev server used to proxy it, which is why
linking worked locally and nowhere else.

The **access token** still reaches the browser — `authHeader()` needs it to sign AniList
GraphQL queries. Only the secret is server-side.

The secret lives in Cloud Secret Manager, not in any env file:

```bash
firebase functions:secrets:set ANILIST_CLIENT_SECRET
```

Functions run on **Node 22** with `firebase-functions` 6 (`firebase-admin` 13). The three
original triggers still use the v1 API via the `firebase-functions/v1` namespace — porting
them to v2 would rewrite their signatures for no behavioural gain. Deploying v2 functions
with secrets needs **firebase-tools 11 or newer**.

## Environment

`.env.local` (gitignored, present locally) holds Vite-prefixed vars. Vite only exposes vars
beginning `VITE_`, and inlines them into the bundle at build time — there is no runtime env
on Firebase Hosting to configure.

- `VITE_API_KEY`, `VITE_AUTH_DOMAIN`, `VITE_PROJECT_ID`, `VITE_STORAGE_BUCKET`, `VITE_MESSAGING_SENDER_ID`, `VITE_APP_ID` — Firebase
- `VITE_ANILIST_CLIENT_ID`, `VITE_ANILIST_CALLBACK_URI` — AniList OAuth. Both are public by
  design. The **client secret is not here** — it is a Cloud Secret, read only by the
  `exchangeAnilistCode` function.

Read them via `import.meta.env.VITE_*`, never `process.env`. `.env.test` holds fake values
so tests are deterministic; Vite's precedence puts it above `.env.local` in test mode.

Note: `.gitignore` also excludes `firebase.json`, `.firebaserc`, `firestore*`, and `storage.rules`,
even though those files exist locally.

## Layout

The `src/` tree is organised **by feature**, not by kind. A page and every part that only
that page uses live in one directory together; `components/` holds only what two or more
features share.

```
index.html           Vite entry point — lives at the project ROOT, not in public/
vite.config.mts      dev server (:3000), build.outDir, vitest config
eslint.config.mjs    flat config; replaced the eslintConfig block in package.json
playwright.config.ts e2e config; baseURL is hardcoded to http://localhost:3000
e2e/                 Playwright specs (.spec.ts) — outside src so vitest ignores them
public/              copied verbatim: favicon.svg/.ico, apple-touch-icon, logo192/512,
                     manifest.json, robots.txt
src/
  App.tsx            Router + the auth-state listener that hydrates global state on login
  index.tsx          React 19 createRoot; wraps App in ApolloProvider + StateProvider
  vite-env.d.ts      /// <reference types="vite/client" /> — types the asset imports
  test-utils.tsx     renderWithProviders() — RTL render wrapped in the app's providers

  layout/            The app shell. AppShell owns the routed Outlet and the open state for
                     the mobile menu and the spotlight. Navigation is the desktop rail,
                     Header the mobile top bar, MobileMenu the overlay it opens.
                     SearchFab + SearchSpotlight are global search. nav-items.ts is the
                     single source for what appears in the rail AND the overlay.
  features/          One directory per page, each holding its own sections and skeleton:
                     browse, calendar, details, discover, people, profile, settings,
                     social, studio, taste, watchlist
  views/             The routes that are not features: Login, SignUp, Callback, Favorites,
                     and the ComingSoon / Community stubs
  components/        Shared only. Card, Badge, SectionHeading, EntityHero, Skeleton
                     (shimmer primitive), PosterGridSkeleton, SplitButton, ToggleSwitch
  config/            firebase.ts (app, auth, db, storage, functions, Apple/Google
                     providers), apollo-client.ts
  context/           useReducer-based global store (StateProvider, reducer, types,
                     initialState). ScrollContainer.tsx shares the scrolling element
                     (see "Scrolling" below)
  api/services/      Firestore reads/writes: favorites.ts, profile.ts, anilist.ts
                     (tokens), session.ts
  graphql/           queries.ts, mutations.ts, featured.ts (handwritten);
                     types.ts (GENERATED — don't edit)
  helpers/           authHeader() (AniList token), mediaPath() / entityPath() (URL rules,
                     shared so no two call sites produce different URLs for one title),
                     scoreTier(), mediaText(), titleLanguage()
  utils/hooks/       useInput, useTilt (pointer tilt — pair with a perspective wrapper)
functions/src/       Cloud Functions: the exchangeAnilistCode callable + auth/Firestore
                     triggers
```

`tsconfig.json` sets `baseUrl: ./src`, so imports are absolute from `src`:
`import Card from 'components/Card'`, `import Discover from 'features/discover/Discover'`
— not relative paths. Follow that convention.

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

**Cloud Functions** (`functions/src/index.ts`): `exchangeAnilistCode` is the OAuth token
exchange (above). `createProfile` and `createFavorites` seed docs on user creation;
`linkedAnilistAccount` flips `users/{uid}.anilistLinked` when an `anilist/{uid}` doc appears.
The client does not depend on any of the three triggers — `App.tsx` reads-or-creates the
user doc itself and `Callback.tsx` sets `anilistLinked` directly, because a trigger that
fires `onCreate` does nothing when a document is overwritten.

**Shell chrome.** `Navigation` is a 72px icon rail that expands to 240px on hover. It is
absolutely positioned and `.app__body` reserves its width with a margin, so expanding it
overlays the page instead of shifting it. Account controls — notifications, settings,
profile, logout — sit in `.navigation__footer` at the bottom. Search is **not** in the
rail; it is a FAB (see below).

**There is no desktop header.** `--header-height` is `0px` above 960px, which is what
drives the Details banner pull-up, the sticky tab bar's offset and every
`calc(100vh - var(--header-height))` view height from one token. `.header` is
`display: none` there. Below 960px the rail is hidden, `--header-height` becomes 72px and
the header returns — carrying the logo lockup and the `MobileMenu` button, nothing else.

**Search.** `SearchSpotlight` is an overlay opened by `SearchFab`, or with ⌘K / `/`;
escape closes, arrows move, enter opens, and focus returns to the trigger. It is
controlled — `AppShell` owns the open state. Results are gated on the current term: Apollo
keeps the last response, so without that the previous search's posters are still there on
reopen.

The trigger is a **fixed-position FAB**, not a rail item. It used to live at the top of the
rail, which put an action inside a list of destinations and — worse — meant it disappeared
below 960px along with the rail, so the mobile header needed a second, inferior inline
search of its own. As a FAB it survives at every width and that duplicate is gone.

**Discover.** A full-bleed `Hero` (crossfading slides, the active slide's poster, a
sideways scrim, score tier badge, CTAs), `AiringThisWeek`, the `Rail` rows, then
`GenreTiles`. Everything is built from the one `Featured` query — `nextAiringEpisode`,
`duration` and `genres` all come back with it, so no section costs an extra request. An
airing card retires itself once the episode's own runtime has elapsed (capped at 90
minutes, defaulting to 24), fading out while the rest reflow and the next one backfills.
Genre tiles link to `/search/anime?genre=`, which `Browse` handles alongside `?search=` —
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
spotlight search with live poster results, Browse with filters, details page (hero + tabs,
parallax, skeleton loading, rankings/tags/links/community stats/recommendations), staff /
character / studio pages, Watchlist (built around progress, not posters), Taste (statistics
from the profile query), Calendar (week / month / agenda), Social (what people you follow
have been watching), Profile, Settings (local preferences + the AniList account), favorites,
Firebase auth (email+password, Google, Apple), AniList linking — which now works in
production, not only in dev. Responsive down to 320px.

Unfinished or parked — mostly deliberate, don't "fix" without asking:
- `views/ComingSoon.tsx` and `views/Community.tsx` are stubs. Their links live in
  `layout/nav-items.ts` rather than commented-out JSX — add an entry there and they appear
  in both the rail and the mobile overlay.
- **`nav-items.test.ts` has 3 failing tests** and has done since Calendar and Social were
  added to the nav. The expectations are stale, not the code: they assert `['discover']`
  and `['watchlist', 'taste']` where the nav now also returns `calendar` and `social`. A
  five-minute fix nobody has made.
- **Calendar and Social have no fixtures and no e2e coverage.** Skipped deliberately to get
  the pages wired; both were verified by hand against the live schema. Adding coverage means
  capturing `AiringSchedule` and `SocialFeed`.
- The "Preferred Watchlist" `Select` in `Settings.tsx` is commented out (`TODO: maybe`).
  `WatchlistFormat` / `preferredWatchlist` exist in the types but are unused.
- The **bio / `about` field is deliberately absent from Settings** — it belongs on a
  profile-edit page that does not exist yet.
- The **bell icon in the nav footer does nothing**. Notifications were not built.
- `features/details/Actions.tsx` carries the only `TODO` left in `src`: the AniList
  save-entry feature. `SplitButton` writes list status but doesn't reflect server state back.
- `components/ActivityMap.tsx` was deleted on 2026-09-05 as the last `styled-components`
  consumer. The idea came back without it: `features/profile/ActivityHeatmap.tsx` is the
  plain-CSS replacement.
- `App.test.tsx` is the CRA default smoke test and is `test.skip`ped. It has never passed
  since the global store landed: it renders `<App />` with no providers, but `App` destructures
  a tuple from `useStateValue()` while `StateProvider` defaults the context to `{}`. Whoever
  repairs it must also switch to `getAllByAltText` — the mobile header adds a second
  `alt="animitchures"` logo, and `getByAltText` throws on multiple matches.

Known rough edges worth knowing before touching related code:
- **Private routes vs. auth timing.** `user` is null on first render, so a hard refresh on
  `/favorites` (or any private route) hits the `*` catch-all and redirects to `/`. There's no
  "auth still resolving" state.
- **The nav rail eats clicks down the left edge of every page.** `.navigation` is
  `position: absolute` at 72px, expanding to 240px on hover, while `.app__body` only
  reserves 72px. Approach anything in the left ~168px from the left and the rail expands
  under the cursor and swallows the click. Invisible in screenshots; it only shows up when
  something is actually clicked, which is why it keeps being rediscovered. Fix it as its own
  change — likely by keeping the collapsed box at 72px and growing it on hover, rather than
  sizing at 240px and relying on `overflow-x: hidden` for the visual.
- **`firestore.rules` allows any signed-in user to read/write any document** — including
  other users' AniList access tokens. A hardened per-uid version exists in the working
  copy but `.gitignore` excludes `firestore*`, so it is in no commit and has never been
  deployed. `firebase deploy --only firestore:rules` applies it.
- **The login backgrounds still ship in the bundle:** `src/images/maiden.jpg` is 5.4MB and
  `usagi.jpeg` is 1.1MB. `animitchures-logo-with-text.png` (182KB) is now referenced by
  nothing at all — the README and the mobile header both moved to the SVG mark.
- **MUI is fully on v9** as of 2026-09-05; `@material-ui` v4 is gone. Note MUI requires
  `@emotion/*` at 11.14+ — 11.8 satisfies the peer range on paper but throws
  `emStyled is not a function` at runtime under vitest.
- **`@emotion/react` and `@emotion/styled` look unused but must stay** — MUI requires them
  as peer dependencies. Styling is otherwise plain CSS files.
- **`@apollo/client` is deliberately held at 3.x** (currently `^3.5.10`). A v4 upgrade was attempted on
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
- **`yarn lint` reports 20 pre-existing warnings and exits 0.** Severities are tuned in
  `eslint.config.mjs` to match what CRA's `react-app` preset reported, so this is the same debt
  that was always there — not a new gate. Note Vite does **not** lint during `build`, unlike CRA.
- **`firebase-functions` 6 and `firebase-admin` 13 are one major behind** (7 and 14 are out).
  The CLI warns about it on every deploy. Advisory, not blocking — unlike the Node 16 runtime
  that preceded them, which was decommissioned and could not deploy at all.
- `api/services/favorites.ts` destructures `{ favorites }` from a possibly-`undefined` resolution,
  which throws if the doc is missing.
- The main JS chunk is **~1.5 MB raw / ~453 kB gzipped**, and Vite warns about it on every
  build. No code splitting is set up; every route is in the one bundle, so each page added
  since the reorganisation has gone straight into it.

## Working agreement

**Never `git commit` or `git push` without Mitchell's express permission, every time.**

Creating branches, staging, editing files and inspecting git state are all fine
unprompted. The commit is the line.

Approval of a *task* is not approval to commit it. "Let's do the security audit",
"create a new branch and do X", "yes let's do that" — these authorise the work, not the
commit at the end of it. Permission given for one branch does not carry to the next, and
permission given earlier in a session does not carry forward.

The test before running either command: **find the message where he asked for _this_
work to be committed.** If there isn't one, stop and offer instead. He usually says yes,
so asking costs a line.

This overrides any skill or workflow that lists committing as a step.

One branch per task, cut from an up-to-date `master`; he merges them himself. Check
`git log HEAD..master` is empty before opening a PR — a 2026-09-06 session stranded 17
commits by branching off a branch rather than off master.

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
