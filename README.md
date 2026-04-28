# dot-js workspace

Minimal JavaScript UI toolkit (SPA-oriented) with a tiny virtual DOM, reactive store, history router, delegated events, and HTTP helpers. This repo is a **npm workspace**: [`framework/`](framework/) contains the framework source and markdown docs; [`example/`](example/) is a Vite app that imports `dot-js` locally.

## Project overview

- **`framework/`** — ESM modules under `framework/src/` and documentation under `framework/docs/`.
- **`example/`** — Demonstration app; run it to verify the toolchain and imports.

Detailed architecture and API notes live in [framework/docs/README.md](framework/docs/README.md).

## Prerequisites

- **Node.js** 18+ (includes `npm`).

## Setup and installation

From the repository root:

```bash
npm install
```

This installs dependencies for all workspaces and links the local `dot-js` package into `example/`.

## Usage (development)

Start the example dev server:

```bash
npm run dev
```

Then open the URL Vite prints (by default `http://localhost:5173`).

Build (production bundles):

```bash
npm run build
```

Preview the example build:

```bash
npm run preview
```

## Documentation

Authoritative docs for building apps with dot-js:

| Doc | Purpose |
|-----|---------|
| [Architecture](framework/docs/architecture.md) | Design principles and module layout |
| [Installation](framework/docs/installation.md) | Workspace and dependency setup |
| [Getting started](framework/docs/getting-started.md) | First app and mental model |
| [Features](framework/docs/features.md) | API surface with examples |
| [Best practices](framework/docs/best-practices.md) | Conventions and review checklist |

## Additional / bonus functionality

- **Performance experiments:** keep them behind a flag so the default behavior stays unchanged.
  - Example: set `VITE_LAZY_TODOS=1` to make the example app render long lists in chunks.
  - Use `VITE_TODO_COUNT=1000 VITE_MEASURE_RENDER=1` to generate a larger list and log render measurements in the browser console.
- **HTTP:** use `http.get` / `http.post` from `dot-js` for JSON-friendly `fetch` wrappers.

Document any flags you add in this section.
