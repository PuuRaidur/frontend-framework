# Best practices and guidelines

## Structure

- Keep **one render function** (or a small composition of pure functions) that turns state into vnodes.
- Put **side effects** (timers, `fetch`) outside the render path, or guard them so they do not run every frame.

## State

- Prefer **fewer, larger `setState` calls** per user action to avoid redundant renders while you are still on a simple subscription model.
- Store **serializable** data (plain objects) so debugging and future persistence stay easy.

## Routing

- Decide early whether **IDs** live in the path (`/task/12`) or query (`/tasks?id=12`) and stick to one style.
- Call **`navigate`** after successful mutations when the URL should reflect the new screen.

## Events

- Use **props** (`onClick`, …) for elements you create in the same render. On re-render, `mount()` replaces the old nodes and their listeners.
- Use **`delegate`** for long lists or global shortcuts so you attach one listener to a stable root.

## Performance

- If lists grow large, add **windowing** or **lazy rendering** behind a flag (see root README “bonus” section). The example app includes `VITE_LAZY_TODOS=1` as a simple reference.
- Measure before optimizing: Chrome Performance panel is enough for student projects.

### Performance decision and validation

dot-js intentionally keeps rendering simple: `mount()` replaces the root contents instead of running a diffing algorithm. This makes the framework easier to understand, but large lists can create unnecessary DOM work because every visible row is recreated on each render.

The example app validates one specific performance decision: long todo lists can be rendered lazily with `VITE_LAZY_TODOS=1`. When the flag is enabled, the UI mounts only the first `lazyLimit` rows and reveals more rows on demand. The default `lazyLimit` is 50, so a 1000 item list initially mounts 50 rows instead of 1000 rows. That reduces initial list DOM work by 95%.

Use these commands from the repository root to compare behavior:

```bash
# Baseline: render every generated todo row.
VITE_TODO_COUNT=1000 VITE_MEASURE_RENDER=1 npm run dev

# Optimized: render the same data, but mount only the first chunk.
VITE_TODO_COUNT=1000 VITE_LAZY_TODOS=1 VITE_MEASURE_RENDER=1 npm run dev
```

On PowerShell, set the same flags like this:

```powershell
$env:VITE_TODO_COUNT="1000"; $env:VITE_MEASURE_RENDER="1"; npm.cmd run dev
$env:VITE_TODO_COUNT="1000"; $env:VITE_LAZY_TODOS="1"; $env:VITE_MEASURE_RENDER="1"; npm.cmd run dev
```

Open the browser console and compare the `[dot-js perf]` logs:

```text
baseline:  lazyRendering=false, totalTodos=1000, mountedRows=1000
optimized: lazyRendering=true,  totalTodos=1000, mountedRows=50
```

The exact `renderMs` value depends on the machine and browser, but the mounted row count is deterministic. The decision is considered validated when the optimized run mounts fewer rows for the same `totalTodos` value and the measured render time does not regress.

## Review checklist

- [ ] `npm install` and `npm run dev` work from a clean clone.
- [ ] Example app demonstrates store, router, events, and HTTP.
- [ ] Docs explain architecture, install, getting started, features, and practices (this folder).
