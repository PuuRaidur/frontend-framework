# Installation

## 1. Clone the repository

Use `git clone` (or download a zip) so you have the `framework/` and `example/` folders at the paths described in the root [README.md](../../README.md).

## 2. Install Node.js

Use an LTS release (18 or newer). Verify:

```bash
node -v
npm -v
```

## 3. Install npm dependencies

From the **repository root** (where the root `package.json` lists `"workspaces"`):

```bash
npm install
```

npm will:

- Create a single `node_modules` tree (hoisted where possible).
- Link the workspace package named `dot-js` into `example/node_modules/dot-js`.

## 4. Run the example

```bash
npm run dev
```

If the dev server starts without module resolution errors, installation succeeded.

## Troubleshooting

- **`Cannot find package 'dot-js'`** — run `npm install` from the repo root, not only inside `example/`.
- **Port already in use** — change the port in `example/vite.config.js` under `server.port`.
