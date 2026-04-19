/**
 * History API router: map URL pathnames to handlers and keep the app in sync with Back/Forward.
 * navigate() updates the URL; popstate handles browser navigation.
 */

/** @type {(() => void) | null} */
let activeListener = null;

/**
 * Returns the pathname used for routing (no query/hash in this minimal version).
 * @returns {string}
 */
export function currentPath() {
  return window.location.pathname;
}

/**
 * Programmatic navigation: pushes a new path and notifies the active router.
 * @param {string} path - e.g. '/todos' or '/active'
 * @param {{ replace?: boolean }} [opts]
 */
export function navigate(path, opts = {}) {
  if (opts.replace) window.history.replaceState(null, "", path);
  else window.history.pushState(null, "", path);
  activeListener?.();
}

/**
 * Creates a router: registers popstate, resolves a route, returns unmount cleanup.
 * @param {(path: string) => void} onRoute - called when path changes (initial + navigate + popstate).
 * @returns {() => void} cleanup - removes listeners
 */
export function createRouter(onRoute) {
  const handler = () => onRoute(currentPath());
  activeListener = handler;
  window.addEventListener("popstate", handler);
  handler();
  return () => {
    window.removeEventListener("popstate", handler);
    if (activeListener === handler) activeListener = null;
  };
}
