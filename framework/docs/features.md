<!-- features.md: API overview with small code samples. -->

# Features and API

## DOM: `h`, `mount`, `text`

- **`h(tag, props, ...children)`** — build an element vnode. Event props use `on*` names (`onClick`, `onInput`, `onSubmit`). Use `className` for the HTML `class` attribute.
- **`mount(parent, vnode)`** — replace `parent`’s children with the rendered tree.
- **`text(str)`** — optional explicit text vnode (plain strings in `children` also work).

```javascript
import { h, mount } from "dot-js";

mount(
  document.getElementById("app"),
  h("button", { onClick: () => alert("ok") }, "Click")
);
```

## State: `createStore`

- **`getState()`** — read current state (treat as immutable from the UI’s perspective).
- **`setState(partial)`** — merge updates; notifies subscribers.
- **`subscribe(fn)`** — run after each `setState`; returns unsubscribe.

```javascript
const store = createStore({ n: 0 });
store.subscribe(() => console.log(store.getState()));
store.setState({ n: 1 });
```

## Router: `createRouter`, `navigate`, `currentPath`

- **`createRouter(onRoute)`** — calls `onRoute(path)` on load, on `navigate`, and on browser Back/Forward (`popstate`).
- **`navigate(path, { replace })`** — change the URL and notify listeners.

```javascript
createRouter((path) => console.log("Now at", path));
navigate("/list");
```

## Events: `delegate`

Attach **one** listener on a root; handle clicks matching a CSS selector.

```javascript
import { delegate } from "dot-js";

const stop = delegate(document.body, "click", "button.del", (ev, el) => {
  ev.preventDefault();
  console.log("Delete", el);
});
stop();
```

## HTTP: `http.get`, `http.post`

JSON-oriented helpers around `fetch`.

```javascript
import { http } from "dot-js";

const data = await http.get("https://jsonplaceholder.typicode.com/todos/1");
```

Errors throw with the response status when `!res.ok`.
