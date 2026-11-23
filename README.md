# Daybook

**A calm, private day planner for e-ink tablets.**

Daybook is a standalone-only Progressive Web App (landscape and portrait) for planning your day and your week, keeping up daily habits and looking back at your progress. It is built for the constraints of e-ink screens: high contrast, no animations, no colour, large touch targets.

Everything stays on your device. Tasks and habits live in IndexedDB, the app makes **no network requests** after it is installed, and there is no account, analytics or telemetry.

This application was **reimplemented from a design prototype with security-by-design principles**: security requirements shaped the architecture, tooling and pipeline from the first commit instead of being added afterwards. See [Security by design](#security-by-design).

## Table of contents

- [Features](#features)
- [Screenshots](#screenshots)
- [Getting started](#getting-started)
- [Architecture](#architecture)
- [Security by design](#security-by-design)
- [Deployment](#deployment)
- [License](#license)

## Features

- **Day view**: hour timeline with a live "now" marker, the day's habits, scheduled and "Anytime" lists, expandable rows with notes, edit, move-to-tomorrow and delete. In portrait it shows one pane at a time and opens on the list.
- **Week view**: Monday to Sunday columns with per-day progress, today highlighted, tap a day to open it. A "Habits" switch at the end of the heading line swaps the same view between tasks and habits.
- **History view**: 18-week completion heatmaps for tasks and for habits, plus a drill-down into any day where tasks and habits can still be checked off.
- **Stats view**: habit streaks (current, longest, 30-day rate, always/never flags), weekly task trend, and completion by weekday, project and priority; portrait splits it into Habits and Tasks panes.
- **About dialog**: tap "Daybook" in the header to see version, build commit and date, and to check for a new version on demand.
- **Daily habits**: up to 7 active habits with just a title, no time, done at any point of the day. Check them off today or on past days, rename or delete them; deleting stops a habit from today on and keeps its past check-ins.
- **Recurring tasks**: daily, weekdays or weekly, with "only this day" or "this and all future days" deletion.
- **Carry-over**: offers to move yesterday's unfinished tasks to today.
- **Offline-first PWA**: installable, precached, with an update prompt.
- **Security by design**: strict CSP, validated persisted data, pinned dependencies and GitHub Actions, no third-party origins.

## Screenshots

| Day | Day with details |
|---|---|
| ![Day view](screenshots/daily-view.png) | ![Day view with an expanded task](screenshots/daily-task-with-details.png) |

| Week | History |
|---|---|
| ![Week view](screenshots/weekly-view.png) | ![History view](screenshots/history-view.png) |

| New task |
|---|
| ![New task dialog](screenshots/new-task-view.png) |

## Getting started

Requires Node.js as pinned in `.nvmrc` (24.17.0 or newer).

```sh
git clone https://github.com/AlexisRoe/task-manager-eink.git
cd task-manager-eink
nvm use        # picks the Node version from .nvmrc
npm ci         # reproducible install from the lockfile
npm run dev    # http://localhost:5173
```

In development the standalone gate is bypassed and an empty store is filled with demo data (`src/dev/seed.fixture.ts`).

To try the installable production build:

```sh
npm run build
npm run preview
```

Then install the app from your browser and open it from the home screen; outside an installed window the production build only shows install instructions.

### Scripts

| Script | Purpose |
|---|---|
| `npm run dev` / `build` / `preview` | Dev server, production build, preview of the build |
| `npm test` / `test:watch` / `coverage` | Vitest (coverage thresholds enforced) |
| `npm run lint` / `lint:fix` / `format` | Biome |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run security` | `npm audit` (high) + signature check |
| `npm run check` | lint + typecheck + coverage + build; run before finishing any change |

## Architecture

```mermaid
flowchart TD
  subgraph Views["views/ and components/"]
    Day[Day view]
    Week[Week view]
    History[History view]
    Modals[New / edit task, habit<br/>delete recurring / habit]
  end

  UI["ui/index.ts<br/>(only UI import point)"]
  Lib[e-ink-ui-lib]

  Hooks["hooks/<br/>day, week, history, habits, actions"]
  Sel["store/tasks.selectors.ts<br/>materialize occurrences and habits"]
  Tasks["store/tasks.store.ts<br/>zustand + persist"]
  Ui["store/ui.store.ts<br/>view, date, open row, modal<br/>(not persisted)"]
  Idb[("IndexedDB<br/>via idb.storage.ts")]
  Mig["tasks.migrations.ts<br/>validate and migrate on load"]
  Utils["utils/<br/>date, time, recurrence, habit,<br/>history, validate"]
  Cfg["config/ and constants/"]

  Views --> UI
  UI --> Lib
  Views --> Hooks
  Hooks --> Sel
  Hooks --> Tasks
  Hooks --> Ui
  Sel --> Utils
  Tasks --> Idb
  Idb --> Mig
  Mig --> Tasks
  Tasks --> Utils
  Utils --> Cfg
```

- **State:** tasks and habits are persisted to IndexedDB; transient UI state is kept separately and never persisted.
- **Recurrence:** recurring tasks are stored as a series plus per-date occurrence state and materialized per day in the selectors; generated occurrences are never stored.
- **Habits:** stored apart from tasks as a habit (active from its start date until it is deleted) plus the dates it was done, so they never mix into task lists or task statistics, and the Week view shows them only when its Habits switch is on. The limit of 7 active habits is enforced in the store ([ADR 0017](docs/decisions/0017-daily-habits.md)).
- **Dates:** local `YYYY-MM-DD` strings and `HH:MM` times handled by pure utilities, no date library.
- **UI:** components come only from `e-ink-ui-lib` through `src/ui/index.ts`. Missing components are built as candidates in `src/ui/candidates/` (none at the moment) and contributed upstream. App CSS is layout only.
- **PWA:** `vite-plugin-pwa` generates the service worker and manifest; `public/_headers` carries the CSP and security headers.

More background lives in `PLAN.md` (roadmap), `CLAUDE.md` (conventions) and `docs/decisions/` (ADRs).

## Security by design

The original prototype loaded web fonts from Google, kept state in memory and had no build or review pipeline. The reimplementation treats security as a requirement of every layer. Vulnerability reporting and the threat model are in [`SECURITY.md`](SECURITY.md); each decision is recorded in [`docs/decisions/`](docs/decisions/).

| Area | What it means here |
|---|---|
| **Data locality** | All data is stored in IndexedDB on the device. No network calls, telemetry, CDNs or third-party origins; fonts and assets are self-hosted. |
| **Content-Security-Policy** | `public/_headers` sets `default-src 'self'`, no inline scripts or styles, `object-src 'none'`, `frame-ancestors 'none'`, `require-trusted-types-for 'script'`, plus `Permissions-Policy` (deny all), `Referrer-Policy: no-referrer`, `nosniff`, COOP and HSTS. The policy is never loosened to make something work; for example the UI library's inline base64 fonts are extracted at build time instead of allowing `data:` fonts. |
| **Untrusted persisted data** | Stored data is validated with type guards on load, schema changes need a versioned migration, and corrupt data is reset with an in-app notice instead of crashing. |
| **Input handling** | Every user input is trimmed, validated and length-limited (task and habit titles 120, notes 1000 characters, `HH:MM` times, enumerated values). User text is only rendered as React text; `dangerouslySetInnerHTML`, `eval` and `new Function` are not used. IDs come from `crypto.randomUUID()`. |
| **Dependencies** | Five runtime dependencies, exact versions pinned, lockfile committed, installs via `npm ci`, `ignore-scripts=true`, `engine-strict`. Each dependency is justified in an ADR. |
| **Supply-chain checks** | `npm run security` runs `npm audit` (fails on high severity) and verifies registry signatures; Dependabot updates npm packages and GitHub Actions weekly. |
| **CI/CD** | GitHub Actions are pinned to commit SHAs with least-privilege `permissions`, no persisted checkout credentials, dependency review, gitleaks secret scanning and CodeQL on every PR. Deployment runs only from `main` in a protected `production` environment with a project-scoped token. |
| **Quality gates** | `npm run check` (lint, strict TypeScript, tests with enforced coverage thresholds, build) must pass before any change is done. |
| **Secrets** | `.env*`, `.dev.vars` and Cloudflare tokens are git-ignored and never committed. |

## Deployment

Merging to `main` runs `.github/workflows/deploy.yml`: `npm run check`, then `wrangler deploy` (static assets from `dist/`, SPA fallback in `wrangler.jsonc`). It needs a `production` environment and a project-scoped `CLOUDFLARE_API_TOKEN` secret.

Set up branch protection on `main` yourself: require the `PR` checks (`check`, `dependency-review`, `secret-scan`) and `CodeQL`, require review, block force pushes.

## License

Released under the [MIT License](LICENSE). Copyright (c) 2026 Alexis Roehrling.
