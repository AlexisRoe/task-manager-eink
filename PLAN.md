# Implementation Plan — Daybook

> Implementation roadmap. Design reference: `prototype/Daybook Planner.html` and `screenshots/`.

## 0. Confirmed decisions
- Persistence: zustand `persist` + IndexedDB (`idb-keyval`).
- Typography: ui-lib fonts only (Inter / JetBrains Mono); no Literata/IBM Plex, no Google Fonts.
- Deleting a recurring task asks: "Only this day" or "This and all future days".
- No backup/export feature.

## Known setup issues
- `e-ink-ui-lib@1.1.1` requires `node >=24.17.0`; `.nvmrc` is `24.15.0` with `engine-strict=true` → bump `.nvmrc` to `24.17.0`.
- `package.json` has `"type": "commonjs"` → change to `"module"`.
- `resources/meta-tags.html` references `/splash/*`, which does not exist → drop those tags.
- `wrangler.jsonc` uses Workers static assets (SPA fallback), not classic Pages; `public/_headers` works with both.

## 1. Goal
Standalone-only PWA (landscape and portrait, see ADR 0016) task planner for e-ink tablets, recreating the prototype's Day / Week / History views and New-task flow with `e-ink-ui-lib` components. All data stays on-device (IndexedDB). Security-by-design across code, deps, tooling and CI.

## 2. Tech stack
React 19 · TypeScript (strict, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`) · Vite · vite-plugin-pwa (Workbox `generateSW`, precache-only) · zustand + `persist` + idb-keyval · Vitest + Testing Library + jsdom + fake-indexeddb · Biome (same config as ui-lib) · e-ink-ui-lib.
Runtime deps are limited to: `react`, `react-dom`, `zustand`, `idb-keyval`, `e-ink-ui-lib`. No date library — dates are local ISO strings (`YYYY-MM-DD`) handled by pure utils + `Intl.DateTimeFormat`.

## 3. Domain model (`src/types/task.types.ts`)
- `TaskInput` shared fields: `title`, `start: "HH:MM" | null` (null = Anytime), `durationMin: 15|30|60|90`, `priority: 1|2|3`, `project: "Work"|"Personal"|"Health"|"Home"`, `notes`.
- `Task` (one-off): `id`, `date`, `done`, `carriedOver`, + `TaskInput`.
- `RecurringSeries`: `id`, `rule: "daily"|"weekdays"|"weekly"`, `anchorDate` (start; weekly uses its weekday), `endDate | null`, + `TaskInput`.
- `OccurrenceState` keyed `"<seriesId>:<date>"`: `{ done: boolean; skipped: boolean }`.
- `DayTask` = materialized view (one-off or occurrence) consumed by UI, with `source: "task" | "series"`.
- Persisted root: `{ version, tasks, series, occurrences, carryDismissedOn: date | null }`.

## 4. Business rules (ported from prototype logic)
- **Materialize day:** one-offs on date + series where `anchorDate ≤ date ≤ endDate?` and rule matches and occurrence not skipped.
- **Sorting:** Scheduled by start time; Anytime by priority; week/history lists: scheduled first, Anytime last.
- **Toggle done:** one-off → `task.done`; occurrence → `occurrences[key].done`.
- **Move to tomorrow:** one-off → change date, `done=false`, `carriedOver=true`; occurrence → mark skipped + create one-off copy on next day (`carriedOver`).
- **Delete:** one-off → remove. Occurrence → modal: "Only this day" (skip) or "This and all future days" (`endDate = date - 1`; drop the series if that is before `anchorDate`).
- **Carry-over banner (today only):** yesterday's undone **one-off** tasks; "Move to today" moves them all (`carriedOver`), "Leave" sets `carryDismissedOn = today`. Shown only if `CARRY_PROMPT_ENABLED`.
- **New task:** title required (trimmed, max length); start optional, validated `H:MM|HH:MM` → normalized; Repeat ≠ None creates a `RecurringSeries` anchored on target date. Target date = current date in Day/Week, today in History. Defaults: 30 min, P2, Work, None.
- **Day header:** "N of M done"; `TODAY` pill if date is today.
- **Row meta:** `Project · ↻ Rule · Carried over · Has note` (Has note hidden when expanded); priority badge shown for P1 (filled) / P2 (outlined) when not done.
- **Timeline:** hour grid `DAY_START_HOUR..DAY_END_HOUR`, blocks positioned by start/duration (min height), done = greyed + strike-through, P1 undone = inverted; click block = expand row; now-marker with live minute clock on today; auto-scroll to now−4h (today) or 08:00 (other days) on date/view change.
- **Week:** ISO week number, Mon–Sun columns, per-day progress bar + `k/n`, today column inverted, past columns tinted, header click → Day view for that date; items toggle done.
- **History:** 18 weeks ending this week; cell buckets (none/ <25 / ≥25 / ≥50 / ≥75 / 100 %), future cells hidden, selected-day outline; a second heatmap for daily habits (ADR 0017); no headline statistics (removed); selected-day list + "Open this day".
- **Nav:** prev/next steps 1 day (Day) or 7 days (Week); "Today" resets; nav hidden in History.
- All tunables live in config (see §6), not in components.

## 5. Code structure & naming
Suffix = purpose: `*.view.tsx`, `*.component.tsx`, `*.hook.ts`, `*.store.ts`, `*.selectors.ts`, `*.utils.ts`, `*.constants.ts`, `*.config.ts`, `*.types.ts`, `*.test.ts(x)`, `*.css` (layout only).
```
src/
  main.tsx
  app/            app.component.tsx, app.css, standalone-gate.component.tsx
  config/         app.config.ts (day range, hour height, flags), storage.config.ts, pwa.config.ts
  constants/      task.constants.ts (durations, priorities, projects, repeat rules, limits),
                  history.constants.ts (weeks, thresholds, buckets), date.constants.ts
  types/          task.types.ts, view.types.ts
  utils/          date.utils.ts, time.utils.ts, recurrence.utils.ts, history.utils.ts,
                  validate.utils.ts, id.utils.ts (crypto.randomUUID)
  store/          tasks.store.ts, tasks.selectors.ts, ui.store.ts (view/date/open/modal — not persisted),
                  idb.storage.ts, tasks.migrations.ts
  hooks/          now.hook.ts, day.hook.ts, week.hook.ts, history.hook.ts, timeline-scroll.hook.ts
  components/     app-header.component.tsx, date-nav.component.tsx, new-task-modal.component.tsx,
                  delete-recurring-modal.component.tsx, task-row.component.tsx, priority-badge.component.tsx
  views/          day/day.view.tsx (+ task-list, carry-over parts), week/week.view.tsx (+ week-column),
                  history/history.view.tsx (+ stats, selected-day)
  ui/             index.ts  ← single import facade: re-exports e-ink-ui-lib (+ local candidates while any exist)
  ui/candidates/<name>/  ← only while a lib component is missing; written in lib conventions (see §7). Currently none: all upstreamed in e-ink-ui-lib 1.2.0
  dev/            seed.fixture.ts (prototype demo data; loaded only when import.meta.env.DEV)
```
App code imports UI **only** from `@/ui`, never directly from `e-ink-ui-lib` or `candidates/`, so swapping a candidate for the published lib version is a one-line change (done for all four, see ADR 0013).

## 6. Config & constants
`app.config.ts`: `DAY_START_HOUR=0`, `DAY_END_HOUR=24`, `HOUR_HEIGHT_PX=88`, `HIDE_DONE=false`, `CARRY_PROMPT_ENABLED=true`, `NOW_TICK_MS=60000`. `storage.config.ts`: IDB db/store names, `SCHEMA_VERSION`. Limits (title/notes length) in `task.constants.ts`.

## 7. UI mapping & ui-lib gaps
| Screen element | ui-lib component |
|---|---|
| App shell | `ThemeProvider`, `ModalProvider` |
| Brand, headings | `Title`, `Text`, `Label` |
| Day/Week/History switch | `Segmented` (**needs controlled `value`** — gap) |
| Prev/next/Today/New task | `Button.IconOutlined`, `Button.Outlined`, `Button` (`iconLeft`) |
| TODAY tag, P1/P2 badge | `Pill` / `Pill.Filled` (sm) |
| Task checkbox | `Checkbox` (controlled) |
| Expanded row actions | `Button.Outlined` |
| Carry-over banner | `Alert` or `Card` + `Button` |
| Week progress | `ProgressBar.Naked` |
| History stats | `Value` |
| New-task modal | `Modal` (+ `CloseButton`/`ActionButton`), `Input`, `TimeInput`, `Chip.Group`, `TextArea`, `Form` |
| Delete-recurring modal | `Modal` + `RadioInput` |

Gaps found (all now upstreamed in e-ink-ui-lib 1.2.0) → were built as candidates in `src/ui/candidates/`, then PR to `AlexisRoe/e-ink-ui-lib`:
1. **Segmented controlled mode** (`value` prop) — view changes from Week header / "Open this day".
2. **TimeGrid** — vertical hour grid with absolutely positioned blocks + now-marker (lib `Schedule` is a list only).
3. **Heatmap** — calendar contribution grid with bucket shades, legend, selectable cells.
4. **Inverted surface** — scoped token swap (primary↔secondary) for the today column (CSS must stay layout-only in the app).
5. **TimeInput clearable** — only if the lib's `TimeInput` can't be reset to empty ("Leave empty for anytime"); verify first.

Candidate workflow: same file layout as the lib (`<name>.component.tsx`, `.component.css` with `eink-` BEM + tokens only, `<name>.test.tsx`, OKF `README.md`, JSDoc). When it's stable: copy to the lib repo, add `<name>.stories.tsx`, export from lib `src/index.ts`, open PR. After the release, bump `e-ink-ui-lib`, re-point `src/ui/index.ts`, delete the candidate.

## 8. Security by design
**Runtime**
- No network at all: no analytics, no CDNs, fonts self-hosted via lib. Service worker precaches own assets only.
- Strict CSP + headers in `public/_headers`: `default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; font-src 'self'; connect-src 'self'; manifest-src 'self'; worker-src 'self'; object-src 'none'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'; require-trusted-types-for 'script'`, plus `Permissions-Policy` (deny all), `Referrer-Policy: no-referrer`, `X-Content-Type-Options: nosniff`, `Cross-Origin-Opener-Policy: same-origin`, `Strict-Transport-Security`. Verify the lib needs no inline `<style>` (React `style` props are allowed).
- No `dangerouslySetInnerHTML`, no `eval`; user text is only rendered as React text.
- Persisted state is untrusted on load: type-guard validation + versioned migrations in `tasks.migrations.ts`; corrupt data → reset with in-app notice, never crash.
- Input validation and length limits on every field; IDs via `crypto.randomUUID()`.
- `navigator.storage.persist()` requested to reduce eviction risk.

**Dependencies & local dev**
- `.npmrc`: keep `save-exact`, `engine-strict`, `audit`; add `ignore-scripts=true` (document any rebuild exceptions in an ADR).
- Lockfile committed, installs via `npm ci` only; minimal deps; `npm audit --audit-level=high` + `npm audit signatures` in `npm run security`.
- Dependabot (npm + github-actions, weekly, grouped minor/patch).
- Optional pre-commit via `simple-git-hooks`: Biome + typecheck on staged files.
- `.gitignore` covers `.env*`, `.dev.vars`, `.wrangler/`, coverage.

**CI (GitHub Actions)**
- Every action pinned to a full commit SHA; workflow-level `permissions: contents: read`; `actions/checkout` with `persist-credentials: false`.
- `pr.yml` on PRs to `main`: lint, typecheck, test with coverage thresholds, build, `npm run security`, `actions/dependency-review-action`, gitleaks secret scan.
- `codeql.yml`: JavaScript/TypeScript analysis on PR + weekly.
- `deploy.yml` (last phase): on push to `main`, build + `wrangler deploy` in a protected `production` environment; `CLOUDFLARE_API_TOKEN` scoped to this project only.
- Branch protection on `main` (required checks, reviews) is set up by the user; documented in README.
- `SECURITY.md` with reporting policy and the threat model summary.

## 9. PWA
- vite-plugin-pwa with the manifest from `resources/manifest.json`, extended with `orientation: "any"`, `display: "standalone"`, name "Daybook", proper description; icons copied to `public/icons/`, `favicon.ico` to `public/`.
- `index.html` gets the meta tags from `resources/meta-tags.html` minus the splash links and minus the manifest link (the plugin injects it).
- **Standalone gate:** in production, if `matchMedia('(display-mode: standalone)')` is false, render an install-instructions screen. Dev bypasses the gate.
- Update flow: `registerType: "prompt"` → lib `Notification` offers a reload.

## 10. Documentation
- JSDoc on every exported type, interface, function, hook and component, describing the **purpose** (not the internals); `@example` for non-trivial components.
- In-code comments only where unavoidable.
- Decisions as ADRs in `docs/decisions/NNNN-title.md` (context / decision / consequences). Initial ADRs: IndexedDB persistence, recurrence model, ui-lib-only typography, candidate-component workflow, CSP policy, ignore-scripts, no date library, standalone gate.
- `README.md`: setup, scripts, architecture overview, deployment.

## 11. Implementation phases (each ends green on `npm run check`)
0. **Tooling baseline:** `.nvmrc` 24.17.0, package.json (`type: module`, engines, scripts: dev, build, preview, typecheck, lint, lint:fix, format, test, test:watch, coverage, security, check), Vite + TS + Biome + Vitest config, `@/` path alias, `.npmrc` hardening, `.gitignore` additions, SECURITY.md, ADR folder.
1. **Domain:** types, constants, config, date/time/recurrence/history/validate utils with exhaustive unit tests (DST, week boundaries, ISO week 1/53, month labels).
2. **Store:** IDB storage adapter, tasks store + actions, selectors, migrations/validation; tests with fake-indexeddb.
3. **UI facade + candidates:** `src/ui/index.ts`; Segmented-controlled, TimeGrid, Heatmap, inverted surface (+ TimeInput-clear if needed), each with tests + README.
4. **Shell:** ThemeProvider, ModalProvider, header, segmented tabs, date nav, standalone gate, ui store, layout CSS (fluid, adapts to landscape and portrait).
5. **Day view:** timeline, scheduled/anytime sections, expandable rows, carry-over banner, now tick + auto-scroll.
6. **Modals:** New task, delete-recurring.
7. **Week view.**
8. **History view.**
9. **PWA + headers:** manifest, SW, `_headers`, update prompt, offline check.
10. **CI/CD:** pr.yml, codeql.yml, dependabot.yml, deploy.yml.
11. **Lib PRs:** move candidates to e-ink-ui-lib, release, swap imports, delete candidates. ✅ Done: lib 1.2.0, ADR 0013.

## 12. Verification
- `npm run check` (lint + typecheck + tests with coverage ≥ 80 % + build) passes at every phase.
- Component tests per view: toggling, move to tomorrow, delete (both recurring options), carry-over, nav, view switching, validation errors in the modal.
- Visual parity: `npm run dev` with the dev seed, compare each view against `screenshots/*.png` at 1248×936.
- `npm run build && npm run preview`: install the PWA in Chromium, confirm standalone in landscape and portrait, reload offline, DevTools Network shows **zero** third-party requests, Console shows no CSP violations, data survives reload and browser restart (IndexedDB).
- CI green on a test PR; Dependabot + CodeQL active.
