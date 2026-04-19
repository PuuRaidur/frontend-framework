/**
 * Event delegation: one listener on a root handles events from descendants.
 * Useful for long lists or when nodes are re-created often (attach once on #app).
 */

/**
 * Delegates DOM events from `root` when the event target matches `selector`.
 * @param {ParentNode} root - e.g. document.getElementById('app')
 * @param {string} type - event type, e.g. 'click'
 * @param {string} selector - CSS selector for matching targets (closest)
 * @param {(ev: Event, target: Element) => void} handler
 * @param {AddEventListenerOptions | boolean} [options]
 * @returns {() => void} cleanup - removes the listener
 */
export function delegate(root, type, selector, handler, options) {
  const listener = (ev) => {
    const t = ev.target;
    if (!(t instanceof Element)) return;
    const match = t.closest(selector);
    if (!match || !root.contains(match)) return;
    handler(ev, match);
  };
  root.addEventListener(type, listener, options);
  return () => root.removeEventListener(type, listener, options);
}
