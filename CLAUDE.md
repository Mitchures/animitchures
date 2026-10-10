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

Verified on Node v24 / yarn 1.22 as of 2026-09-18: `yarn lint` exits 0 with 16 pre-existing
warnings; `yarn e2e` is 95 passing across `setup`, `public` and `authed`, and `yarn e2e:live`
passes against the real API. Unit: **117 passing, 1 skipped** (`App.test.tsx`, the CRA
default — see "Current state"). A red `yarn test` now *is* something you broke: the three
stale `nav-items` failures were fixed on 2026-09-18.

`yarn test` and `yarn test:watch` pin `TZ=Asia/Tokyo`, because the Discover derivations are
tested against a fixture captured at a known JST instant and the day-boundary maths would
otherwise depend on the machine's timezone.

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
even though those files exist locally — and `.env` plus every `.env.*` except the
deliberately-fake `.env.test`.

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

  styles/tokens.css  Every colour, radius, duration and curve, light and dark. Imported
                     first from index.css. Component CSS reads tokens and declares no raw
                     colour, radius or duration of its own.
  layout/            The app shell. AppShell owns the routed Outlet and the open state for
                     the More drawer and the spotlight. PillNav is the fixed desktop
                     column, TabBar the floating phone bar, Drawer what More opens,
                     MobileHeader the phone top bar. SearchSpotlight is global search,
                     opened from the top bar or ⌘K. nav-items.ts is the single source for
                     all three renderers; useSlidingIndicator.ts drives the one moving
                     pill they share.
  features/          One directory per page, each holding its own sections and skeleton:
                     browse, calendar, details, discover, people, profile, settings,
                     social, studio, taste, watchlist
  views/             The routes that are not features: Login and SignUp (both inside
                     AuthShell, with AuthProviders, PasswordField and auth-error.ts),
                     Callback, Favorites, and the ComingSoon / Community stubs
  components/        The design system, shared only. Primitives: Surface, Pill, Chip,
                     Button, IconButton, DotNumber (every numeral in the app). Composites:
                     FrostedTile, ScoreChip, InfoCard, LinkTile, StatRow, EpisodeCard,
                     EpisodeRow, PosterEchoCard, SectionHeading, TileDeck (a
                     FrostedTile that cycles figures), FactTile (a figure in a
                     squircle with an icon chip). Not yet redesigned:
                     Card, EntityHero, Skeleton (shimmer primitive),
                     PosterGridSkeleton, SplitButton, ToggleSwitch, AnilistReconnect
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

**When AniList refuses the token.** An expired or revoked token comes back as **HTTP 400
"Invalid token"** — not 401; only a request with no credentials at all gets 401. The Apollo
error link (`config/apollo-client.ts`) catches a refusal *of a token we actually sent* — the
same "Unauthorized." arrives for accounts that simply never linked, which is a normal state —
clears the browser copy and flips `anilistTokenRefusedVar` (`helpers/anilist-session.ts`).
`useAnilistReconnect` deletes the dead `tokens/{uid}` document (or `hydrateSession` would read
it straight back) and derives "needs reconnect" from an AniList profile existing with no token,
which survives a reload with nothing persisted. `AppShell` shows the `AnilistReconnect` banner
and Social its panel. Only 6 of 18 call sites send credentials — the Social feed, Details, and
the three writes; Watchlist, Taste and Profile read public data by user id and are untouched.
Clearing the token also lets the authenticated reads fall back to public mode, so after a
refusal it is the *writes* that stay broken, which is what the banner says.

**The rate limit is 30 requests a minute, not 90.** AniList has been running degraded for a
long time; `x-ratelimit-limit: 30` is what the live API returns. Spending it gets HTTP 429
with a Cloudflare **HTML** body, which is why it used to surface as `ServerParseError:
Unexpected token '<'` and nothing about rate limits. A `RetryLink`
(`helpers/anilist-rate-limit.ts`) retries a 429 — and only a 429, since a 400 is a refused
token and retrying it would delay the reconnect prompt — four times with exponential backoff
and jitter. `Retry-After` is read when present but usually is not: AniList's
`access-control-expose-headers` lists only `X-RateLimit-*`, so a cross-origin read returns
null and the backoff ladder takes over. The `RateLimitNotice` banner is **armed, not raised**,
on the first refusal and only appears if the trouble outlasts `NOTICE_DELAY_MS` — showing it
immediately put a warning on screen ahead of the skeletons it was explaining, for a problem
that was usually over within two seconds.

**Per-page request counts are already lean — one request per page**, and client-side
navigation is properly cached (Discover, into a title, back, the same title again, three tab
switches: two requests). Measure before optimising here; the `e2e/anilist-mock.ts` route is
the hook, and counting offline costs no budget. What is *not* free is a reload — the cache is
memory-only and nothing is persisted, so every refresh refetches, and `Featured` alone is
173 KB.

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

**Shell chrome.** `PillNav` is a **fixed 248px** column of pills: wordmark, the two big
text tabs (Explore / Library), the destinations, then the account row with the avatar,
Settings and Log out. Fixed, not hover-expanding — the old rail sized itself at 240px and
relied on `overflow-x: hidden`, so the left ~168px of every page swallowed clicks. A single
`--nested` pill slides between destinations (`useSlidingIndicator`) rather than each item
lighting up.

Below 960px the column is hidden and `TabBar` takes over: a floating frosted pill 16px from
the edges holding four destinations plus **More**, which springs `Drawer` up from behind it.
`getBarItems` always fills the four slots — Watchlist when AniList is linked, else
Favorites, else Login — and `getDrawerItems` holds the remainder. **More is hidden when
signed out**, because every public destination already has a slot and the drawer would open
on nothing; signed in it always shows, since the account row lives there. `MobileHeader`
carries the brand, search and avatar, nothing else.

**There is no desktop header.** `--header-height` is `0px` above 960px, which is what
drives the Details banner pull-up, the sticky tab bar's offset and every
`calc(100vh - var(--header-height))` view height from one token. Search and notifications
sit in `.app__topbar`, which is **`position: absolute`** for that reason: in flow it pushed
every view down by its own height and the Details banner stopped reaching the top edge.
Below 960px `--header-height` becomes 64px and `MobileHeader` returns.

The tab bar and drawer are **glass** — plain `backdrop-filter: blur()` with a light rim.
The Chromium-only `feDisplacementMap` refraction is gone with `GlassFilters.tsx` and the
`navigator.userAgentData` gate in `index.html`: WebKit renders this, so every iPhone gets
the same glass as Chrome. If that bend is ever wanted back, the traps are in git history
(Chromium drops every function after a `url()`; a blur primitive fades out at the filter
region's edge; WebKit answers `CSS.supports()` true and paints nothing).

**Search.** `SearchSpotlight` is an overlay opened by the top bar's search button, or with ⌘K / `/`;
escape closes, arrows move, enter opens, and focus returns to the trigger. It is
controlled — `AppShell` owns the open state. Results are gated on the current term: Apollo
keeps the last response, so without that the previous search's posters are still there on
reopen.

The trigger is **not** a nav item: search is an action, not a destination. It has one home
at each width — `.app__topbar` above 960px, `MobileHeader` below — which replaced the
floating action button that replaced the rail item.

**Discover** is the A1 dashboard. **There is no greeting** — it came off on 2026-09-18
because a welcome line said nothing, so the `StatRow` of dot-matrix figures opens the page.
`.discover`'s top padding is therefore the whole gap above it, and it is tuned to line that
row up with `PillNav`'s Explore / Library tab across the gutter — **centres, not baselines**,
since the tab is 28px Inter Tight and the figures are 30px Doto. If the column's own top
spacing changes, that padding has to move with it, in `Discover.css` and
`DiscoverSkeleton.css` both. `derive.ts` still exports a tested `greeting()` that nothing
renders; a signed-in header or a profile page is its next home.

The page is: a `StatRow` of dot-matrix figures, the `TimeStrip`,
then a grid of `SlideHero` over three `TileDeck` widgets with `LinkTile` + `InfoCard`
beside them, then `EpisodeCard`s and `PosterEchoCard`s, `SeasonWeeks`, `GenreTiles`,
`ComingLater` and `PopularList`. Below 960px the strip becomes
`DayPills` + an `EpisodeRow`, and the widgets become a snapping rail.

**The three widgets are `TileDeck`s, not static tiles.** Each cycles three figures on one
time horizon — tonight, this week, the moment — six seconds a slide, the decks offset by
`DECK_STAGGER_MS` so they never flip together, which reads as a glitch rather than as three
independent readouts. They replaced three tiles holding one fact each, two of which repeated
something the page already said: the third was the season countdown, which is on the
`InfoCard` beside it almost word for word.

A deck is a list of `DeckSlide`s that the page filters, so **a figure that is not there
produces no slide rather than a zero** — on a quiet night the Tonight deck holds one slide,
stops cycling and drops its pager, falling back to the tick footer. Rotation pauses on hover
*and* on focus: auto-advancing content needs a way to stop and hover alone leaves a keyboard
user without one, so `FrostedTile` takes `onPointerEnter` / `onFocus` / `onBlur`
pass-throughs (pass-throughs rather than a DOM spread, because the tile already owns
`onPointerMove` and `onPointerLeave` for the colour layer's drift). The pager stays
decorative rather than becoming buttons: buttons inside a link are invalid markup and a click
on one would navigate. Reduced motion keeps the content and drops the movement — instant
swap, ten seconds a slide — since stopping the rotation would hide two thirds of what the
tile says.

**Four slide ideas were computed and dropped, and are not worth re-proposing:** finales and
premieres this week (neither exists in a typical week — both are zero in the fixture), how
far through the season we are (**negative** for the quarter before a season starts, and the
countdown card already owns that window), the season's best score (every unaired title has a
null `averageScore`, so the whole bucket is null) and studio of the season (the leader has
two titles and everything else has one).

Two things the real data forced:

- **`bestScored` breaks ties on popularity.** Re:ZERO Season 4 and BLEACH both score 90 in
  the fixture week, so without a tiebreak the winner came down to AniList's bucket order and
  BLEACH filled three of the nine slides.
- **Tonight's third slide is `mostAwaited`, not the best score.** Tonight's highest-scored
  title is usually also its first episode, so two of three slides named the same show; the
  slide excludes the first-up title explicitly.

**`TimeStrip` opens the page** — one static strip of the next 35 days, placed by air date
across and by how many people are waiting up. It replaced `WeekStrip` (eight day columns of
one week) on 2026-09-18. Three things about it are load-bearing:

1. **A filled speck is a continuing episode; a ring is a premiere.** That one distinction
   carries the strip's whole statement, because the premieres are not spread out: in the
   fixture September holds 14 continuing episodes and 1 premiere while October holds 9
   premieres and nothing continuing. So it reads left to right as specks turning into rings
   and says "a season is handing over" with no copy. A ring needs a **7px minimum diameter**
   — at 4.5px with a 1.6px stroke it is a solid dot again and the distinction is lost. The
   earlier version marked week boundaries with tall lines instead, which was furniture
   dressed as structure.
2. **One tall mark: off the scale.** `upperFence()` is the interquartile rule, so this is a
   property of the response rather than a named title. ONE PIECE's 747,774 against a fence of
   167,894 is the only one in the fixture, and lifting it out of the band gives the other 25
   **1.7× more vertical room**.
3. **Hovering snaps a glass puck to the nearest *day*, not to a dot.** The unit of the answer
   is then unambiguous, a day with seven episodes is as easy to point at as a lone one, and
   the gesture is `PillNav`'s sliding indicator, so the strip reads as part of the app rather
   than as a chart. Its date label sits **above** the capsule: below it crossed the tick row,
   and inside it the capsule's own height clipped it.

The collision pass is what makes a packed day legible, and it is needed because **neither
axis separates same-day episodes on its own.** Two air at exactly 22:30 with 30,550 and
38,390 waiting, which is 2.4px apart on a 90px band; and at 32px a day an hour is 1.3px, so
x cannot express time of day either. So x snaps to the day and the column is spread
vertically by the radii its dots actually have, which costs nothing the axis could have said.

Layout is **measured**, via `ResizeObserver` on the plot, so the placement recomputes on a
resize. Position the puck with `left` and leave the centring to the stylesheet: an inline
`translate` overwrites the CSS `translate: -50%` and leaves the capsule's edge on the pointer.
`--glass-raised` is the token for glass that sits *on* the data — opaque enough to read text
against, translucent enough that what it covers carries through. There is deliberately **no
colour wash behind the strip**; one was built and dropped, so the board is a plain
translucent panel.

**Every figure is derived in `features/discover/derive.ts`** — a pure module tested against
`e2e/fixtures/Featured.json`, because the page's whole claim is that its counts are true and
a wrong count looks exactly like a right one. Nothing on the page costs a second request:
it is all the one `Featured` query, whose variables come from `featuredVariables()` in
`graphql/featured.ts`, which `AuthShell` calls too — identical variables mean one cache
entry, where previously the login page sent none and the sign-in path fetched 173 KB of
`Featured` twice. That helper also owns the season maths: the old `getNextSeason` walked the
list with `index < SEASONS.length - 1`, so FALL had no successor and September to November
asked for `season: null`.

The tiles' palettes are seeded from each title's `coverImage.color` (`helpers/tile-palette.ts`),
so the colour comes from the content. `e2e/live.spec.ts` asserts that colour still arrives —
without it the tiles fall back to a fixed green that looks deliberate.

`GenreTiles` sits fourth from the end: eight `FrostedTile`s at `size="sm"`, which scales every disc
diameter off one `--ds` variable — discs sized for a 168px widget flood a 132px tile and it
reads as a flat gradient card. Each genre's colour **and** treatment come from `GENRE_TILES`
in `helpers/tile-palette.ts`, assigned rather than derived: seeding from `coverImage.color`
collapses, because Attack on Titan leads Action, Drama, Fantasy *and* Mystery. The palettes
come from one formula — cap L84, body L64/S62, accent a +26° hue shift at L57 — so accents
shift hue sideways instead of darkening out of the family.

`SeasonWeeks` ("Starting this season") is a snapping rail of week cards, one per calendar
week of the season, each naming its most-anticipated premiere. It **bleeds to the screen
edge below 960px only**; at desktop a rail running past the content column read as a
mistake rather than as a hint that it scrolls.

`ComingLater` and `PopularList` close the page, and between them they consume the
`nextSeason` and `popular` buckets that used to be fetched and unused. Both are deliberately
asymmetric, because a row of equal cards says nothing about which entry matters:

- **Coming later** gives the most-awaited next-season title a `FrostedTile` in its own cover
  colour with a ripple of concentric rings behind it — the rings reach further the more
  people are waiting, capped at a round 300,000 so the gesture means the same thing from one
  season to the next. The three runners-up are quiet rows with a tick strip showing their
  reach against the lead. The lime "Most awaited" chip is the only lime in the section.
- **All-time popular** compares six titles with a dotted matrix: **one dot per 25,000
  members across 42 slots.** Scaled from zero instead, an all-time top six all read 80–100
  per cent and the block says nothing; quantised this way they read 42, 40, 39, 38, 35, 34.
  The matrix quantises, so the exact figure is printed beside it. The leader's row sits on
  `--nested` and its last four dots go lime.

Two things `ComingLater` needed that are worth knowing before composing another tile:

1. **`FrostedTile` puts every child in one `frostedTile__number` div,** which is a single
   flex item laying its own children out inline. That is right for the one numeral it was
   built for; a composed card must restyle that slot as the column (`.comingLater__lead
   .frostedTile__number`) or its title and caption render on the same line.
2. **A cover-derived palette can be too pale for white text.** `--on-tile` is white in both
   themes, and `paletteFromColor` passes the cover colour straight through as the body, so
   JUJUTSU KAISEN's `#78aee4` left white text on near-white glass. Both `.frostedTile--sm`
   and the lead card solve it the same way, with a scrim `::before` above the colour and
   below the content.

`PopularList` clamps lightness rather than mixing toward the text colour:
`oklch(from var(--tone) min(l, 0.68) c h)`, inverted to `max()` in dark. Half of an all-time
top six have pale covers that vanish on a near-white row, and mixing toward `--ink` fixed
that but turned orange to brown and yellow to olive. Relative colour syntax is behind an
`@supports` guard with the raw colour as the fallback.

**Squircle corners.** Square surfaces use the reference's continuous corner, via
`corner-shape: var(--corner)` where `--corner` is `squircle`. It **pairs with**
`border-radius` rather than replacing it, so an engine that does not know the property paints
the plain rounding and no fallback branch is needed. Measured as supported in Chromium 153
and WebKit 26.6, and it survives the production minifier — 21 declarations reach the bundle.

Three things to know before extending it:

1. **A squircle at the same radius reads *tighter*, not rounder** — its shoulders flatten and
   the corner pulls in, because `squircle` is `superellipse(2)`, whose |x|⁴+|y|⁴=1 curve is
   fuller than a circle's. So the radii went up with the shape, and kept going: `--r-card` is
   **76px** (52px below 960px) and `--r-inner` 34px. Matching the reference means both
   changes, not just the one.

   **Raising a radius silently breaks the spacing inside every card that reads it,** which is
   why the padding is derived from it rather than picked:

   ```css
   --pad-card:  max(1.125rem, calc(var(--r-card)  * 0.4));
   --pad-inner: max(0.875rem, calc(var(--r-inner) * 0.42));
   ```

   Content x px in from a side clears the bottom edge by
   `r − r·(1−((r−x)/r)⁴)^(1/4)` — at `--r-card` 76px, an 18px pad left only 7.5px, and the
   episode card's tick strip and the tiles' footers sat on the curve. Two things still needed
   hand-fixing: `EpisodeCard`'s min-height went 190→244px, because its run strip uses
   `margin-top: auto` and there was no slack left to spend; and `.frostedTile__footer` took a
   `max-width: calc(100% - var(--r-card) * 0.5)`, because the season tile's 31 ticks crossed
   both bottom corners at full width.
2. **Pills, chips, avatars and switches keep `round` on purpose.** A superellipse at a radius
   clamped to half the box flattens a pill's ends and turns a circular avatar into a blob.
   `--r-pill` carries no `corner-shape`, which is what keeps them out of it.
3. **`getComputedStyle().cornerShape` is not a reliable check** — several distinct keywords
   serialise to `superellipse(2)` in Chromium 153 while rendering differently. Screenshot it.

It is applied only to the **phase-1 surfaces**: everything reading `--r-card` / `--r-inner`,
plus the raw-radius surfaces in `layout/`, `features/discover/` and the redesigned
`components/`. Details, Profile, Watchlist, Settings and AuthShell still carry their old
radii and get the shape when their own phase lands, so the app is two-toned here as well.

**Scrolling.** The window never scrolls: `.app__body` is a fixed-height `overflow-y: auto`
box. So `useScroll()` from framer-motion silently produces zeros, and window scroll
listeners never fire. `AppShell` publishes that element through `ScrollContainerProvider`;
read it with `useScrollContainer()` and drive a `MotionValue` from its `scrollTop`
(`Details.tsx` is the worked example). `useInView` is unaffected — IntersectionObserver
still resolves against the viewport.

**Details page.** Rebuilt to the reference on 2026-09-18 as **stacked glass**: a 340px band
of banner art, then a glass sheet pulled 104px up over it carrying the poster, the title,
the genre chips and four `FactTile`s. The poster hangs above the sheet's top edge and is the
one thing crossing the seam, which is what ties the two together. The banner reads as light
behind frosted glass rather than as a photo with text on it, so it works whether the art is
dark or blown out — and Cowboy Bebop has **no `coverImage.color` at all**, so this page
cannot be colour-derived the way the home page's tiles are.

Three things about it are load-bearing:

1. **The glass on artwork is dark-tinted, not white.** `--glass-art` is
   `rgba(18, 18, 22, 0.34)` with a light rim, in both themes. A white translucent button over
   a bright banner bleaches to a flat blob and the icon inside it disappears; the reference
   gets away with white because its ground is a pastel gradient and a banner is not.
2. **The hero's actions sit at the *bottom* right of the art, not the top.** At the top they
   landed in the same corner as `.app__topbar`'s theme, search and notification buttons — and
   that bar is `position: absolute`, so it overlays the banner rather than pushing it down.
   Five buttons in one corner read as one confused row. Back stays top-left, where the top
   bar is not.
3. **The parallax lives on the banner image alone.** The sheet is in the flow and carries the
   tabs and the body below it, so translating it would drag them. The image still drifts at
   ~34% of scroll speed (`bannerY`, 0→210px over 620px of scroll, against a 260px
   over-extension) and the actions drift at half that, because they belong to the art. The
   old `heroY` / `heroOpacity` went with the old in-banner hero.

`HeroFacts` replaced `HeroMeta`'s chip row and `HeroRankings`' badges, which between them
said format, episodes, runtime, status and two rankings — six things in two registers, none
prominent. Four `FactTile`s with icon chips are scannable, and the rest of those fields were
already in the sidebar. A tile is dropped rather than rendered empty, because plenty of
titles have no score and an unaired one has no ranking. Deleting `HeroRankings` orphaned
`components/Badge`, which is gone too.

`SplitButton` moved from the deleted `Actions` onto the sheet rather than onto the art: it
opens a dropdown, and a menu over a photograph is unreadable. It is the only thing that
actually writes list status, so losing it with `Actions` would have been a real regression.
It still carries its old styling.

The tabs are pills now, matching the navigation, and take an icon each — they were the only
underlined thing left in the app. **Everything below the tabs still runs on the old CSS**
(`Summary`, `Sidebar`, `Characters`, `Staff`, `MediaStats`, `MediaTags`, `WhereToWatch`,
`Recommendations`), so the page is two-toned at the tab boundary until that phase lands.

The old shape, for reference: a hero over the banner (poster, title, alternative titles,
genres, four stat chips, actions) followed by tabs: Overview, Characters, Staff, Relations. The active
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

**Design system, phase 1 (2026-09-18):** `styles/tokens.css`, the shared components listed
under `components/` above, Discover and the navigation were rebuilt to the SuperPower
reference design in light and dark. Every other page still runs on its old CSS until its own
phase — so the app is deliberately two-toned right now. The spec and plan are in
`docs/superpowers/` (gitignored, working copy only).

Working: Discover (A1 dashboard — see above),
spotlight search with live poster results, Browse with filters, details page (hero + tabs,
parallax, skeleton loading, rankings/tags/links/community stats/recommendations), staff /
character / studio pages, Watchlist (built around progress, not posters), Taste (statistics
from the profile query), Calendar (week / month / agenda), Social (what people you follow
have been watching), Profile, Settings (local preferences + the AniList account), favorites,
Firebase auth (email+password, Google, Apple) on rebuilt Login and Sign-up pages (a wall of
cover art behind a glass card, responsive to 320px, Enter submits, inline errors, both
providers on both pages), AniList linking — which now works in production, not only in dev —
and a clear reconnect prompt when that link expires. Rate-limit resilience: a 429 is retried
with backoff rather than blanking the page. Responsive down to 320px.

Unfinished or parked — mostly deliberate, don't "fix" without asking:
- `views/ComingSoon.tsx` and `views/Community.tsx` are stubs. Their links live in
  `layout/nav-items.ts` rather than commented-out JSX — add an entry there and they appear
  in both the rail and the mobile overlay.
- **Calendar and Social have no fixtures and no e2e coverage.** Skipped deliberately to get
  the pages wired; both were verified by hand against the live schema. Adding coverage means
  capturing `AiringSchedule` and `SocialFeed`.
- The "Preferred Watchlist" `Select` in `Settings.tsx` is commented out (`TODO: maybe`).
  `WatchlistFormat` / `preferredWatchlist` exist in the types but are unused.
- The **bio / `about` field is deliberately absent from Settings** — it belongs on a
  profile-edit page that does not exist yet.
- The **bell icon in the nav footer does nothing**. Notifications were not built.
- **Squircles cover the redesigned surfaces only.** The other pages get them with their own
  phase — see "Squircle corners" under Architecture notes.
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
- **`firestore.rules`, `storage.rules` and `firebase.json` are gitignored, so a change to
  any of them is in no commit, no branch and no clone, and `git status` will never mention
  it.** The hardened Firestore rules (each collection restricted to its owning uid, deny by
  default), the Storage rules (deny all — the app does not use Storage) and the hosting
  security headers were all deployed on 2026-09-12, but each sat in a working copy for a
  week beforehand looking done. When you change one of these files, say plainly that it
  needs a deploy.
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
- **`yarn lint` reports 16 pre-existing warnings and exits 0.** Severities are tuned in
  `eslint.config.mjs` to match what CRA's `react-app` preset reported, so this is the same debt
  that was always there — not a new gate. Note Vite does **not** lint during `build`, unlike CRA.
- **`firebase-functions` 6 and `firebase-admin` 13 are one major behind** (7 and 14 are out).
  The CLI warns about it on every deploy. Advisory, not blocking — unlike the Node 16 runtime
  that preceded them, which was decommissioned and could not deploy at all.
- `api/services/favorites.ts` destructures `{ favorites }` from a possibly-`undefined` resolution,
  which throws if the doc is missing.
- **The `DetailsList` fixture holds three favourites and reports `hasNextPage: false`,** so no
  test walks the paging path in `views/Favorites.tsx`. A real 52-title list took four serial
  requests at the old `perPage` of 15; it is 50 now, and Apollo's `fetchMore` owns the merging
  rather than an accumulator in an effect. Simulate a longer list if you touch it.
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
  (`.features`, `.features__header`). **Component CSS reads tokens only** — no raw
  colours, radii or durations. Plain CSS is global, so check a new component's class
  name is not already taken: `components/EpisodeRow` is named that way because
  `features/watchlist/ListRow` already owns `.listRow`.
- **Every numeral renders through `DotNumber`** — scores, ranks, counts, episode numbers.
  Doto is for figures only, never prose.
- Animate `translate`/`scale` rather than `transform` where an element also has a hover
  transform: an animation with a `forwards` fill wins the cascade for the property it
  animates, so animating `transform` permanently beats the hover.
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
- **The token-expiry specs are destructive, and put back what they destroy.** Making the app
  believe AniList refused its credential makes it delete `tokens/{uid}` from real Firestore —
  correct behaviour, but it left the account looking permanently unlinked for every later run.
  `e2e/seed-token.ts` restores it in an `afterAll`, and `yarn e2e` is idempotent as a result.
  If a signed-in spec ever fails claiming the AniList session expired, check the document
  exists before suspecting the app: that exact symptom cost a debugging session once, with the
  suite faithfully reporting the truth about state it had itself deleted. Note `seed-token.ts`
  loads `.env.local` itself — `playwright.config.ts` loads only `.env.test.local`, which has
  the account credentials but not the Firebase project config.
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
