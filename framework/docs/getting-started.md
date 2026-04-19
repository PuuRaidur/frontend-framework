<!-- getting-started.md: smallest end-to-end app using dot-js. -->

# Getting started

## Mental model

1. **State** lives in a `createStore` object.
2. **View** is a function that builds a tree with `h()` and applies it with `mount()`.
3. **Subscriptions** connect them: `store.subscribe(render)`.

## Minimal example (sketch)

```javascript
import { h, mount, createStore } from "dot-js";

const root = document.getElementById("app");
const store = createStore({ message: "Hello" });

function render() {
  const { message } = store.getState();
  mount(root, h("p", null, message));
}

store.subscribe(render);
render();
```

## Add routing

```javascript
import { createRouter, navigate } from "dot-js";

const store = createStore({ path: window.location.pathname });

store.subscribe(render);

createRouter((path) => store.setState({ path }));

// Somewhere in the UI:
navigate("/tasks");
```

## Next steps

- Read [Features](features.md) for the full API.
- Copy `example/src/main.js` as a starting point for your Todo app.
