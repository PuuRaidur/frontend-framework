// Tiny "virtual DOM":
// - `h()` builds plain objects that describe a DOM tree
// - `mount()` turns that tree into real DOM under a root element

/**
 * Flattens mixed children (arrays, nested arrays) into a single array of vnodes or strings.
 * @param {unknown[]} xs
 * @returns {(object|string)[]}
 */
function flattenChildren(xs) {
  /** @type {(object|string)[]} */
  const out = [];
  for (const x of xs) {
    if (x == null || x === false) continue;
    if (Array.isArray(x)) out.push(...flattenChildren(x));
    else out.push(x);
  }
  return out;
}

/**
 * Creates a virtual node (vnode) describing an element tree.
 * @param {string} type - HTML tag name, e.g. 'div', 'button'.
 * @param {Record<string, unknown> | null} props - attributes, styles, and event props (onClick, …).
 * @param {...unknown} children - child vnodes, strings, or nested arrays.
 * @returns {{ type: string, props: Record<string, unknown>, children: (object|string)[] }}
 */
export function h(type, props = null, ...children) {
  return {
    type,
    props: props ? { ...props } : {},
    children: flattenChildren(children),
  };
}

/**
 * Creates a text vnode (string children in `h()` are also supported).
 * @param {string} value
 * @returns {{ type: 'text', props: {}, children: [], value: string }}
 */
export function text(value) {
  return { type: "text", props: {}, children: [], value: String(value) };
}

/**
 * Applies a plain object of styles to an element (camelCase keys → CSS properties).
 * @param {HTMLElement} el
 * @param {Record<string, string>} style
 */
function applyStyle(el, style) {
  Object.assign(el.style, style);
}

/**
 * Wires event props: any prop starting with "on" is treated as a listener.
 * @param {HTMLElement} el
 * @param {Record<string, unknown>} props
 */
function bindEventProps(el, props) {
  const eventNameFromProp = (key) => {
    const raw = key.slice(2);
    if (!raw) return null;
    const lower = raw.toLowerCase();
    if (lower === "doubleclick") return "dblclick";
    return lower;
  };

  for (const [key, val] of Object.entries(props)) {
    if (!key.startsWith("on") || typeof val !== "function") continue;
    const evt = eventNameFromProp(key);
    if (!evt) continue;
    el.addEventListener(evt, /** @type {EventListener} */ (val));
  }
}

/**
 * Creates a DOM node from a vnode (recursive).
 * @param {object|string} vnode
 * @returns {Node}
 */
function createNode(vnode) {
  if (typeof vnode === "string") return document.createTextNode(vnode);
  if (vnode.type === "text") return document.createTextNode(vnode.value);

  const el = document.createElement(vnode.type);

  for (const [k, v] of Object.entries(vnode.props)) {
    if (k === "style" && v && typeof v === "object") {
      applyStyle(el, /** @type {Record<string, string>} */ (v));
      continue;
    }
    if (k.startsWith("on")) continue;
    if (k === "className") el.setAttribute("class", String(v));
    else if (v === true) el.setAttribute(k, "");
    else if (v != null && v !== false) el.setAttribute(k, String(v));
  }

  bindEventProps(el, vnode.props);

  for (const child of vnode.children) {
    el.appendChild(createNode(child));
  }

  return el;
}

/**
 * Mounts a vnode under a parent element (replaces all existing children).
 * @param {ParentNode} parent
 * @param {object|string} vnode
 * @returns {Node} The root node that was mounted.
 */
export function mount(parent, vnode) {
  parent.replaceChildren();
  const node = createNode(vnode);
  parent.appendChild(node);
  return node;
}
