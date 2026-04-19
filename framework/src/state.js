/**
 * Minimal reactive store: hold app state, update it, notify subscribers.
 * UI code subscribes once and re-renders when state changes.
 */

/**
 * Creates a simple store with get/set/subscribe.
 * @template T
 * @param {T} initialState
 * @returns {{
 *   getState: () => T,
 *   setState: (patch: Partial<T> | ((prev: T) => Partial<T>)) => void,
 *   subscribe: (fn: () => void) => () => void
 * }}
 */
export function createStore(initialState) {
  /** @type {T} */
  let state = structuredClone(initialState);
  /** @type {Set<() => void>} */
  const listeners = new Set();

  return {
    /** @returns {T} */
    getState() {
      return state;
    },

    /**
     * Merges a partial update into state (immutable-style replace of top-level keys used in patch).
     * @param {Partial<T> | ((prev: T) => Partial<T>)} patch
     */
    setState(patch) {
      const partial = typeof patch === "function" ? patch(state) : patch;
      state = { ...state, ...partial };
      for (const fn of listeners) fn();
    },

    /**
     * Registers a listener called after every setState. Returns an unsubscribe function.
     * @param {() => void} fn
     * @returns {() => void}
     */
    subscribe(fn) {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },
  };
}
