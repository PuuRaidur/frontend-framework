/**
 * dot-js — public entry point.
 * Re-exports the small modules that make up the framework so apps can:
 *   import { h, mount, createStore, createRouter, http } from 'dot-js'
 */

export { h, mount, text } from "./dom.js";
export { createStore } from "./state.js";
export { createRouter, navigate, currentPath } from "./router.js";
export { delegate } from "./events.js";
export { http } from "./http.js";
