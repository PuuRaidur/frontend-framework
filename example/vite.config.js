/**
 * Vite config for the example app.
 * The `dot-js` package is linked via npm workspaces (see root package.json).
 */
import { defineConfig } from "vite";

export default defineConfig({
  server: {
    port: 5173,
  },
});
