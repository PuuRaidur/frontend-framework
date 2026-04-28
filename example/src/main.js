// dot-js example app
//
// Goal: keep the code tiny, but still prove the framework features work:
// - State store + re-rendering
// - Router (links update the URL)
// - Event props (onSubmit / onClick)
// - Event delegation (delegate())
// - HTTP helpers (http.get / http.post)

import "./style.css";

import {
  h,
  mount,
  createStore,
  createRouter,
  navigate,
  delegate,
  http,
} from "dot-js";

const app = document.getElementById("app");
if (!app) throw new Error('Missing #app root — check example/index.html');

// Optional performance experiment:
// When enabled, we only render the first N todos and let the user "show more".
const ENABLE_LAZY_TODOS = import.meta.env.VITE_LAZY_TODOS === "1";
const TODOS_API = "https://jsonplaceholder.typicode.com/todos";

const store = createStore({
  todos: [],
  filter: "all", // "all" | "active" | "completed"
  loading: false,
  posting: false,
  error: null,
  notice: null,
  lazyLimit: 50,
}, "dot-js-todos-state");

function getTodoInput() {
  const input = document.getElementById("todo-input");
  return input instanceof HTMLInputElement ? input : null;
}

function nextTodoId(todos) {
  return todos.reduce((max, todo) => Math.max(max, todo.id), 0) + 1;
}

function visibleTodosFor(filter, todos) {
  if (filter === "active") return todos.filter((t) => !t.done);
  if (filter === "completed") return todos.filter((t) => t.done);
  return todos;
}

function addLocalTodo(text) {
  store.setState((prev) => ({
    todos: [...prev.todos, { id: nextTodoId(prev.todos), text, done: false }],
  }));
}

async function loadTodosFromAPI() {
  store.setState({ loading: true, error: null });
  try {
    const apiTodos = await http.get(`${TODOS_API}?_limit=5`);
    if (!Array.isArray(apiTodos)) throw new Error("Unexpected API response");

    store.setState({
      todos: apiTodos.map((todo) => ({
        id: todo.id,
        text: `Todo: ${todo.title}`,
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

async function addTodoViaAPI() {
  const { posting } = store.getState();
  const input = getTodoInput();
  const title = input?.value.trim() ?? "";
  if (!input || posting || !title) return;

  store.setState({ posting: true, error: null, notice: null });
  try {
    const result = await http.post(TODOS_API, {
      title,
      completed: false,
      userId: 1,
    });

    const id =
      result && typeof result === "object" && "id" in result ? Number(result.id) : NaN;

    store.setState((prev) => ({
      todos: [
        ...prev.todos,
        { id: Number.isFinite(id) ? id : nextTodoId(prev.todos), text: title, done: false },
      ],
      posting: false,
      notice: Number.isFinite(id) ? `Posted to API (fake): id=${id}` : "Posted to API (fake)",
    }));
    input.value = "";
    input.focus();
  } catch (error) {
    store.setState({
      posting: false,
      error: "Failed to post todo to API",
    });
    console.error("Failed to post todo:", error);
  }
}

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

function filterLink(label, filter) {
  const href = FILTER_TO_PATH[filter];
  return h("a", {
    href,
    onClick: (e) => {
      e.preventDefault();
      navigate(href);
    },
  }, label);
}

function render() {
  const { todos, filter, loading, posting, error, notice, lazyLimit } = store.getState();
  const visibleTodos = visibleTodosFor(filter, todos);

  const shouldLazyRender = ENABLE_LAZY_TODOS && visibleTodos.length > lazyLimit;
  const renderedTodos = shouldLazyRender ? visibleTodos.slice(0, lazyLimit) : visibleTodos;

  const todoItems = renderedTodos.map((todo) =>
    h("li", {
      className: todo.done ? "todo-row done" : "todo-row",
      "data-id": String(todo.id),
    }, [
      `${todo.done ? "[x]" : "[ ]"} ${todo.text} `,
      h("button", {
        className: "todo-delete",
        "data-id": String(todo.id),
      }, "Delete"),
    ])
  );

  // Everything below is just building a vnode tree. The framework does the DOM work in mount().
  mount(app, h("div", { className: "app" }, [
    h("h1", null, "dot-js example"),

    // Small UI messages.
    ENABLE_LAZY_TODOS && h("div", { className: "muted" }, "Perf flag enabled: VITE_LAZY_TODOS=1"),
    notice && h("div", { className: "notice" }, notice),
    error && h("div", { className: "error" }, error),
    loading && h("div", null, "Loading todos..."),

    // The list itself.
    h("ul", null, todoItems),

    // Lazy list controls (only when the flag is enabled and the list is large).
    shouldLazyRender && h("div", { className: "row" }, [
      h("span", null, `Showing ${renderedTodos.length} / ${visibleTodos.length}`),
      h("button", { onClick: () => store.setState((p) => ({ lazyLimit: p.lazyLimit + 50 })) }, "Show 50 more"),
      h("button", { onClick: () => store.setState({ lazyLimit: 50 }) }, "Reset"),
    ]),

    // A real form submission flow (onSubmit) + a POST demo button (http.post).
    h("form", {
      className: "row",
      onSubmit: (e) => {
        e.preventDefault();
        const form = e.currentTarget;
        if (!(form instanceof HTMLFormElement)) return;
        const text = String(new FormData(form).get("todo") || "").trim();
        if (!text) return;
        addLocalTodo(text);
        form.reset();
        getTodoInput()?.focus();
      },
    }, [
      h("input", { id: "todo-input", name: "todo", placeholder: "New todo..." }),
      h("button", { type: "submit" }, "Add Todo"),
      h("button", { type: "button", disabled: posting, onClick: addTodoViaAPI }, posting ? "Posting..." : "Add via API"),
    ]),

    // Router demo: these are real links, but we prevent full-page reload and call navigate().
    h("nav", { className: "nav" }, [
      filterLink("All", "all"),
      filterLink("Active", "active"),
      filterLink("Completed", "completed"),
    ]),

    // GET demo (http.get).
    h("button", { onClick: loadTodosFromAPI, disabled: loading }, "Load from API"),
  ]));
}

// Delegation: one "click" listener handles all current/future rows and delete buttons.
const stopDelete = delegate(app, "click", ".todo-delete", (event, deleteBtn) => {
  event.preventDefault();
  event.stopPropagation();
  const id = Number(deleteBtn.getAttribute("data-id"));
  if (!Number.isFinite(id)) return;

  store.setState((prev) => ({
    todos: prev.todos.filter((t) => t.id !== id),
  }));
});

const stopToggle = delegate(app, "click", ".todo-row", (event, row) => {
  const target = event.target;
  if (target instanceof Element && target.closest(".todo-delete")) return;
  const id = Number(row.getAttribute("data-id"));
  if (!Number.isFinite(id)) return;

  store.setState((prev) => ({
    todos: prev.todos.map((t) => (t.id === id ? { ...t, done: !t.done } : t)),
  }));
});

// Re-render the whole UI whenever state changes.
store.subscribe(render);

// Router: keep the URL and the filter in sync.
const stopRouter = createRouter((path) => {
  const filter = PATH_TO_FILTER[path] ?? "all";
  const normalizedPath = PATH_TO_FILTER[path] ? path : "/";

  if (normalizedPath !== path) {
    navigate(normalizedPath);
    return;
  }

  store.setState({ filter });
});

// Dev-only cleanup for Vite hot reload.
if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    stopDelete();
    stopToggle();
    stopRouter();
  });
}
