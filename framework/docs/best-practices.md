<!-- best-practices.md: guidelines for apps built with dot-js. -->

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

- Use **props** (`onClick`, …) for elements you create in the same render.
- Use **`delegate`** for lists that re-mount often or for global shortcuts.

## Performance

- If lists grow large, add **windowing** or **lazy rendering** behind a flag (see root README “bonus” section).
- Measure before optimizing: Chrome Performance panel is enough for student projects.

## Review checklist

- [ ] `npm install` and `npm run dev` work from a clean clone.
- [ ] Example app demonstrates store, router, events, and HTTP.
- [ ] Docs explain architecture, install, getting started, features, and practices (this folder).
