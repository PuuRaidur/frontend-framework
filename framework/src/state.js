/**
 * Minimal reactive store: hold app state, update it, notify subscribers.
 * UI code subscribes once and re-renders when state changes.
 * Optionally persists state to localStorage.
 */

/**
 * Creates a simple store with get/set/subscribe.
 * @template T
 * @param {T} initialState
 * @param {string} [localStorageKey] - Optional key to persist state in localStorage
 * @returns {{
 *   getState: () => T,
 *   setState: (patch: Partial<T> | ((prev: T) => Partial<T>)) => void,
 *   subscribe: (fn: () => void) => () => void
 * }}
 */
export function createStore(initialState, localStorageKey) {
  /** @type {T} */
  let state = structuredClone(initialState);
  
  // Load state from localStorage if key provided
  if (localStorageKey && typeof localStorage !== 'undefined') {
    try {
      const saved = localStorage.getItem(localStorageKey);
      if (saved) {
        state = { ...state, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.warn(`Failed to load state from localStorage under key "${localStorageKey}"`, e);
    }
  }
  
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
      
      // Save to localStorage if key provided
      if (localStorageKey && typeof localStorage !== 'undefined') {
        try {
          localStorage.setItem(localStorageKey, JSON.stringify(state));
        } catch (e) {
          console.warn(`Failed to save state to localStorage under key "${localStorageKey}"`, e);
        }
      }
      
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
