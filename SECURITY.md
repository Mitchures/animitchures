# Security audit — 2026-09-12

A pass over what the app exposes to a browser, what guards the data, and what
ships in the bundle. Findings are ordered by what an attacker could actually do,
not by what a scanner scores.

Everything marked **fixed** is in this branch. Everything marked **needs you** is
in a file `.gitignore` excludes (`firebase.json`, `firestore.rules`,
`storage.rules`), so it exists only on the machine it was written on and has to
be deployed by hand.

---

## 1 · Firestore rules are wide open in production — **needs you**

**Impact: any signed-in user can read every other user's AniList access token.**

`firestore.rules` in the working copy restricts each collection to its owning
uid with a deny-by-default catch-all. It has never been deployed. Production
still runs a rule allowing any authenticated user to read or write any document
in `users`, `favorites`, `anilist` and `tokens`.

An AniList access token is enough to read and modify that person's anime list.
Getting one requires only a free account on this app.

```bash
firebase deploy --only firestore:rules
```

This is the single most serious item here, and it is one command. It keeps being
deferred because `.gitignore` excludes `firestore*`, so the hardened file is in
no commit, no branch, and no clone — `git status` will never mention it.

## 2 · Cloud Storage allowed any signed-in user to read or overwrite anything — **needs you**

`storage.rules` was `allow read, write: if request.auth != null`.

The app does not use Cloud Storage at all — `getStorage()` is constructed in
`src/config/firebase.ts` and exported, but nothing imports it. So this rule
guarded nothing and opened everything. Now `if false`, with a note to grant a
specific path if storage is ever adopted.

```bash
firebase deploy --only storage
```

## 3 · Third-party HTML was injected unsanitised — **fixed**

`features/details/Summary.tsx` rendered AniList's `description` through
`dangerouslySetInnerHTML`. Those descriptions are **community-edited**.

Sampling 25 trending titles found only `<br>`, `<b>` and `<i>`, no event
attributes, no `<script>`, no `javascript:` URLs — so AniList appears to
sanitise on its side. "Appears to" is the problem: that describes today's output
of a field strangers can edit, and the app keeps an AniList access token in
`localStorage`, which any injected script can read. One stored payload in one
popular title's synopsis would harvest tokens from everyone who opened it.

`helpers/sanitize-html.ts` now allowlists `br b strong i em`, strips every
attribute from what survives, unwraps other tags so their text is kept, and
removes `script`/`style`/`iframe`/`svg` and similar whole. Six unit tests cover
it, including `<img onerror>` and `javascript:` hrefs.

## 4 · Dependency vulnerabilities — **mostly fixed**

`yarn audit` reported **168 vulnerabilities, 9 critical**, which is alarming and
mostly irrelevant: the bulk are in `@graphql-codegen`'s dependency tree, a
**devDependency** that runs at build time and never reaches a browser. Scoping to
runtime dependencies gave 15, of which these actually shipped:

| package | severity | outcome |
|---|---|---|
| `moment` 2.29.3 | High — ReDoS | bumped to **2.30.1** |
| `graphql` 16.3 | Moderate — DoS | bumped to **16.14.2** |
| `lodash` 4.17.21 | High — code injection via `_.template` | **removed entirely** |

`lodash` had no fix available: the advisory names 4.18.0 as patched and lodash
4.18 was never released. It was in the bundle for a single `cloneDeep` call in
`Favorites.tsx`, now `structuredClone`.

Two **critical** advisories remain and were verified **not to ship**:
`websocket-driver` arrives via `firebase > @firebase/database > faye-websocket`,
which is the Node transport — browsers use the native WebSocket. Confirmed by
grepping the built bundle: neither `faye-websocket` nor `websocket-driver`
appears in `build/`.

## 5 · Response headers — **needs you**

Firebase Hosting served no security headers at all. `firebase.json` now sets
`X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`,
`Permissions-Policy` and `Strict-Transport-Security`. Deploys with hosting.

**No CSP yet, deliberately.** A Content-Security-Policy is the header that would
most reduce the impact of finding 3, but it is also the one that silently breaks
things — this app loads images from AniList's CDN, fonts from Google, and talks
to Firebase, Google and Apple auth endpoints. It needs to be written against the
real origin list and tested in report-only mode first. Worth doing as its own
task.

## 6 · What the bundle exposes — **verified correct**

Every `VITE_` variable was checked against a fresh production build:

| variable | in bundle | verdict |
|---|---|---|
| `VITE_API_KEY`, `VITE_AUTH_DOMAIN`, `VITE_PROJECT_ID`, `VITE_STORAGE_BUCKET`, `VITE_MESSAGING_SENDER_ID`, `VITE_APP_ID` | yes | **correct** — Firebase web config is public by design |
| `VITE_ANILIST_CLIENT_ID` | yes | correct — a public OAuth client id |
| `VITE_ANILIST_CLIENT_SECRET` | **no** | fixed earlier by moving the exchange into a Cloud Function |

A Firebase web API key is an identifier, not a credential. It is meant to be
public, and the security it does not provide is supposed to come from Auth and
the Firestore rules — which is exactly why finding 1 matters so much.

Also checked: no hardcoded secret-shaped literals anywhere in `src` or
`functions/src`, and the AniList client secret **has never appeared in git
history**.

## 7 · `.gitignore` did not cover `.env` — **fixed**

Only the `*.local` variants were ignored. A plain `.env` or `.env.production`
with real credentials would have been committed. Now `.env` and `.env.*` are
ignored with an explicit exception for `.env.test`, which holds deliberately
fake values and is meant to be tracked.

## 8 · The AniList token lives in `localStorage` — **accepted, documented**

`helpers/auth-header.ts` reads it from `localStorage`, so any successful XSS can
exfiltrate it. Moving it out of reach would mean proxying every authenticated
AniList call through a Cloud Function — a real project, not a tweak.

The mitigation taken instead is to close the injection route (finding 3) and to
plan a CSP (finding 5). Worth revisiting if the app ever accepts user-authored
content of its own.

---

## What to run

```bash
firebase deploy --only firestore:rules   # finding 1 — the important one
firebase deploy --only storage           # finding 2
firebase deploy --only hosting           # finding 5, ships with the next deploy
```

## Still open

- A Content-Security-Policy, written against the real origin list and rolled out
  report-only first.
- An expired or revoked AniList token currently fails silently; tracked
  separately.
- `firebase-functions` 6 and `firebase-admin` 13 are each one major behind.
