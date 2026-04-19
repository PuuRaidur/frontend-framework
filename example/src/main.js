/**
 * Example bootstrap: wire store + router + render into #app.
 * Replace this file with your Todo (or other) app as you build features.
 */

import {
  h,
  mount,
  createStore,
  createRouter,
  navigate,
} from "dot-js";

/** Root element provided by index.html */
const app = document.getElementById("app");
if (!app) throw new Error('Missing #app root — check example/index.html');

/** Tiny demo state; swap for Todo state later */
const store = createStore({ count: 0, path: window.location.pathname });

/** Renders the whole tree whenever state or route changes */
function render() {
  const { count, path } = store.getState();
  mount(
    app,
    h("div", { className: "app" }, [
      h("h1", null, "dot-js example"),
      h("p", null, `Route: ${path}`),
      h("p", null, `Count: ${count}`),
      h(
        "button",
        {
          onClick: () => store.setState({ count: count + 1 }),
        },
        "Increment"
      ),
      h(
        "button",
        {
          onClick: () => navigate("/demo"),
        },
        'Go to /demo'
      ),
    ])
  );
}

// Subscribe first so the router's initial setState triggers a render.
store.subscribe(render);

/** Sync URL path into the store on load, navigate(), and browser Back/Forward */
const stopRouter = createRouter((path) => {
  store.setState({ path });
});

/** Example cleanup if hot-reload or tests tear down the app */
if (import.meta.hot) {
  import.meta.hot.dispose(() => stopRouter());
}
