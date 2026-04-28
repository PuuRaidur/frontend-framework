// Example app for dot-js.
// It's intentionally small, but it exercises: state, routing, event props, delegation, and HTTP.

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

// Optional perf flag: render long lists in chunks.
const ENABLE_LAZY_TODOS = import.meta.env.VITE_LAZY_TODOS === "1";
const ENABLE_RENDER_MEASURE = import.meta.env.VITE_MEASURE_RENDER === "1";
const PERF_TODO_COUNT = Number(import.meta.env.VITE_TODO_COUNT || 3);

function createInitialTodos() {
  const baseTodos = [
    { id: 1, text: "Buy milk", done: false },
    { id: 2, text: "Go out for a walk", done: false },
    { id: 3, text: "Buy groceries", done: false },
  ];

  if (!Number.isFinite(PERF_TODO_COUNT) || PERF_TODO_COUNT <= baseTodos.length) {
    return baseTodos;
  }

  return [
    ...baseTodos,
    ...Array.from({ length: PERF_TODO_COUNT - baseTodos.length }, (_, index) => {
      const id = baseTodos.length + index + 1;
      return {
        id,
        text: `Generated performance todo ${id}`,
        done: id % 3 === 0,
      };
    }),
  ];
}

const store = createStore({
  todos: createInitialTodos(),
  filter: "all", // "all" | "active" | "completed"
  loading: false,
  posting: false,
  error: null,
  notice: null,
  lazyLimit: 50,
}, "dot-js-todos-state");

async function loadTodosFromAPI() {
  store.setState({ loading: true, error: null });
  try {
    const apiTodos = await http.get("https://jsonplaceholder.typicode.com/todos?_limit=5");
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
  const input = document.getElementById("todo-input");
  if (!(input instanceof HTMLInputElement)) return;
  const title = input.value.trim();
  if (posting || !title) return;

  store.setState({ posting: true, error: null, notice: null });
  try {
    const result = await http.post("https://jsonplaceholder.typicode.com/todos", {
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
    requestAnimationFrame(() => focusTodoInput());
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

function focusTodoInput() {
  const input = document.getElementById("todo-input");
  if (!(input instanceof HTMLInputElement)) return;
  input.focus();
  input.setSelectionRange(input.value.length, input.value.length);
}

function nextTodoId(todos) {
  return todos.reduce((max, todo) => Math.max(max, todo.id), 0) + 1;
}

function render() {
  const { todos, filter, loading, posting, error, notice, lazyLimit } = store.getState();
  const renderStart = ENABLE_RENDER_MEASURE ? performance.now() : 0;
  const visibleTodos =
    filter === "active"
      ? todos.filter((t) => !t.done)
      : filter === "completed"
      ? todos.filter((t) => t.done)
      : todos;

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

  mount(
    app,
    h("div", { className: "app" }, [
      h("h1", null, "dot-js example"),
      ENABLE_LAZY_TODOS &&
        h("div", { className: "muted" }, "Perf flag enabled: VITE_LAZY_TODOS=1"),
      notice && h("div", { className: "notice" }, notice),
      error && h("div", { className: "error" }, error),
      loading && h("div", null, "Loading todos..."),
      h("ul", null, todoItems),
      shouldLazyRender &&
        h("div", { className: "row" }, [
          h("span", null, `Showing ${renderedTodos.length} / ${visibleTodos.length}`),
          h("button", {
            onClick: () =>
              store.setState((prev) => ({ lazyLimit: prev.lazyLimit + 50 })),
          }, "Show 50 more"),
          h("button", { onClick: () => store.setState({ lazyLimit: 50 }) }, "Reset"),
        ]),
      h("form", {
        onSubmit: (e) => {
          e.preventDefault();
          const form = e.currentTarget;
          if (!(form instanceof HTMLFormElement)) return;
          const text = String(new FormData(form).get("todo") || "").trim();
          if (!text) return;
          store.setState((prev) => ({
            todos: [
              ...prev.todos,
              { id: nextTodoId(prev.todos), text, done: false },
            ],
          }));
          form.reset();
          requestAnimationFrame(() => focusTodoInput());
        },
        className: "row",
      }, [
        h("input", {
          id: "todo-input",
          name: "todo",
          placeholder: "New todo...",
        }),
        h("button", { type: "submit" }, "Add Todo"),
        h("button", {
          type: "button",
          disabled: posting,
          onClick: addTodoViaAPI,
          title: "Demonstrates http.post()",
        }, posting ? "Posting..." : "Add via API"),
      ]),
      h("nav", { className: "nav" }, [
        h("a", {
          href: FILTER_TO_PATH.all,
          onClick: (e) => {
            e.preventDefault();
            navigate(FILTER_TO_PATH.all);
          },
        }, "All"),
        h("a", {
          href: FILTER_TO_PATH.active,
          onClick: (e) => {
            e.preventDefault();
            navigate(FILTER_TO_PATH.active);
          },
        }, "Active"),
        h("a", {
          href: FILTER_TO_PATH.completed,
          onClick: (e) => {
            e.preventDefault();
            navigate(FILTER_TO_PATH.completed);
          },
        }, "Completed"),
      ]),
      h("button", { 
        onClick: loadTodosFromAPI,
        disabled: loading,
      }, "Load from API"),
    ])
  );

  if (ENABLE_RENDER_MEASURE) {
    console.info("[dot-js perf]", {
      lazyRendering: shouldLazyRender,
      totalTodos: todos.length,
      visibleTodos: visibleTodos.length,
      mountedRows: renderedTodos.length,
      renderMs: Number((performance.now() - renderStart).toFixed(2)),
    });
  }
}

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

store.subscribe(render);

const stopRouter = createRouter((path) => {
  const filter = PATH_TO_FILTER[path] ?? "all";
  const normalizedPath = PATH_TO_FILTER[path] ? path : "/";

  if (normalizedPath !== path) {
    navigate(normalizedPath);
    return;
  }

  store.setState({ filter });
});

if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    stopDelete();
    stopToggle();
    stopRouter();
  });
}
