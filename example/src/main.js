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
  http,
} from "dot-js";

/** Root element provided by index.html */
const app = document.getElementById("app");
if (!app) throw new Error('Missing #app root — check example/index.html');

/** Todo app state */
const store = createStore({
  path: window.location.pathname,
  todos: [
    { id: 1, text: "Buy milk", done: false },
    { id: 2, text: "Go out for a walk", done: false },
    { id: 3, text: "Buy groceries", done: false },
  ],
  draft: "",
  filter: "all", // "all" | "active" | "completed"
  loading: false,
  error: null,
}, "dot-js-todos-state");

// Load todos from API on startup
async function loadTodosFromAPI() {
  store.setState({ loading: true, error: null });
  try {
    // Using a mock API endpoint for demonstration
    const todos = await http.get("https://jsonplaceholder.typicode.com/todos?_limit=5");
    store.setState({
      todos: todos.map((todo, index) => ({
        id: index + 1,
        text: todo.title,
        done: todo.completed,
      })),
      loading: false,
    });
  } catch (error) {
    store.setState({
      error: "Failed to load todos from API",
      loading: false,
    });
    console.error("Failed to load todos:", error);
  }
}

// Call this function to demonstrate HTTP functionality
// loadTodosFromAPI();

const PATH_TO_FILTER = {
  "/": "all",
  "/active": "active",
  "/completed": "completed",
};

const FILTER_TO_PATH = {
  all: "/",
  active: "/active",
  completed: "/completed",
};

/** Keep typing smooth because this demo renderer remounts on each update. */
function setDraftAndRestoreCaret(value) {
  store.setState({ draft: value });
  requestAnimationFrame(() => {
    const input = document.getElementById("todo-input");
    if (!(input instanceof HTMLInputElement)) return;
    input.focus();
    input.setSelectionRange(input.value.length, input.value.length);
  });
}

function nextTodoId(todos) {
  return todos.reduce((max, todo) => Math.max(max, todo.id), 0) + 1;
}

function render() {
  const { todos, draft, filter, loading, error } = store.getState();
  const visibleTodos =
    filter === "active"
      ? todos.filter((t) => !t.done)
      : filter === "completed"
      ? todos.filter((t) => t.done)
      : todos;

  const todoItems = visibleTodos.map((todo) =>
    h("li", {
      className: "todo-row",
      "data-id": String(todo.id),
      style: {
        cursor: "pointer",
        textDecoration: todo.done ? "line-through" : "none",
      },
    }, [
      `${todo.done ? "[x]" : "[ ]"} ${todo.text} `,
      h("button", {
        className: "todo-delete",
        "data-id": String(todo.id),
      }, "Delete"),
    ])
  );

  mount(
    app,
    h("div", { className: "app" }, [
      h("h1", null, "dot-js example"),
      error && h("div", { style: { color: "red" } }, error),
      loading && h("div", null, "Loading todos..."),
      h("ul", null, todoItems),
      h("input", {
        id: "todo-input",
        value: draft,
        onInput: (e) => setDraftAndRestoreCaret(e.target.value),
        placeholder: "New todo...",
      }),
      h("button", {
        onClick: () => {
          const text = draft.trim();
          if (!text) return;
          store.setState((prev) => ({
            todos: [
              ...prev.todos,
              { id: nextTodoId(prev.todos), text, done: false },
            ],
            draft: "",
          }));
        },
      }, "Add Todo"),
      h("button", { onClick: () => navigate(FILTER_TO_PATH.all) }, "All"),
      h("button", { onClick: () => navigate(FILTER_TO_PATH.active) }, "Active"),
      h("button", { onClick: () => navigate(FILTER_TO_PATH.completed) }, "Completed"),
      h("button", { 
        onClick: loadTodosFromAPI,
        disabled: loading,
      }, "Load from API"),
    ])
  );
}

/** Delegated delete handler: one listener for all current/future todo buttons. */
function handleDeleteClick(event) {
  const target = event.target;
  if (!(target instanceof Element)) return;
  const deleteBtn = target.closest(".todo-delete");
  if (!deleteBtn) return;

  event.stopPropagation();

  const id = Number(deleteBtn.getAttribute("data-id"));
  if (!Number.isFinite(id)) return;

  store.setState((prev) => ({
    todos: prev.todos.filter((t) => t.id !== id),
  }));
}

/** Delegated row toggle handler for done/undone. */
function handleRowToggleClick(event) {
  const target = event.target;
  if (!(target instanceof Element)) return;

  // Keep delete clicks from toggling the row.
  if (target.closest(".todo-delete")) return;

  const row = target.closest(".todo-row");
  if (!row) return;

  const id = Number(row.getAttribute("data-id"));
  if (!Number.isFinite(id)) return;

  store.setState((prev) => ({
    todos: prev.todos.map((t) => (t.id === id ? { ...t, done: !t.done } : t)),
  }));
}

app.addEventListener("click", handleDeleteClick);
app.addEventListener("click", handleRowToggleClick);

// Subscribe first so the router's initial setState triggers a render.
store.subscribe(render);

/** Sync URL path into the store on load, navigate(), and browser Back/Forward */
const stopRouter = createRouter((path) => {
  const filter = PATH_TO_FILTER[path] ?? "all";
  const normalizedPath = PATH_TO_FILTER[path] ? path : "/";

  if (normalizedPath !== path) {
    navigate(normalizedPath);
    return;
  }

  store.setState({ path: normalizedPath, filter });
});

/** Example cleanup if hot-reload or tests tear down the app */
if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    app.removeEventListener("click", handleDeleteClick);
    app.removeEventListener("click", handleRowToggleClick);
    stopRouter();
  });
}
