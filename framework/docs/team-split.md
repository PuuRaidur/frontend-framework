<!-- team-split.md: suggested ownership for two teammates working on dot-js + example. -->

# Two-person split

Use this as a **starting point** — adjust if one person prefers docs or tooling.

## Person A — core runtime (framework code)

**Owns:** `framework/src/dom.js`, `framework/src/state.js`, `framework/src/events.js`

- Virtual tree (`h`), mounting (`mount`), attributes/styles, event props (`onClick`, …).
- Store (`createStore`): `getState` / `setState` / `subscribe`.
- Delegation helper (`delegate`).
- Keeps the example app building when you change the API (coordinate small API changes with Person B).

## Person B — platform + app wiring

**Owns:** `framework/src/router.js`, `framework/src/http.js`, `framework/src/index.js` exports layout, and the **example app** (`example/`)

- Router (`createRouter`, `navigate`) and URL ↔ state wiring in `example/src/main.js`.
- HTTP helpers (`http.get` / `http.post`) and any `fetch` usage in the example (e.g. Todo API).
- Vite config, scripts, and **documentation** updates under `framework/docs/` plus pointers in the root `README.md`.

## How you work together

1. **Agree on the public API** once (names like `h`, `mount`, `createStore`) — then avoid renaming without pairing.
2. **Merge small PRs frequently** so `npm run dev` always runs from a clean `main`.
3. **Touch points:** Person B’s router and example must call Person A’s `h` / `mount` / `store`; resolve conflicts in `example/src/main.js` by talking briefly, not long-lived branches.

## Suggested order (first sprint)

1. Together: `npm install`, run `npm run dev`, read `getting-started.md`.
2. Person A: extend DOM/store as needed for Todo lists and forms.
3. Person B: wire routes (e.g. `/all`, `/active`, `/completed`) and HTTP for remote/mock data.
4. Together: Todo polish, one performance bonus behind a flag, doc pass.
