# CLAUDE.md

Guidance for Claude Code in this repository.

## Purpose
"Daybook" — a landscape-only, standalone-only PWA task planner for e-ink tablets. All data is stored locally (IndexedDB); the app makes no network requests. Source of truth for intent: `CONCEPT.md`; implementation roadmap: `PLAN.md`; design reference: `prototype/` and `screenshots/`.

## Commands
- `npm run dev` / `npm run build` / `npm run preview`
- `npm test` / `npm run test:watch` / `npm run coverage`; single file: `npx vitest run path/to/file.test.ts`
- `npm run typecheck`, `npm run lint`, `npm run lint:fix`, `npm run format`
- `npm run security` — npm audit + signature check
- `npm run check` — lint + typecheck + tests + build. Run before considering any change done.
Use `npm ci` to install (never plain `npm install` without intent to change the lockfile). Node version: `.nvmrc`.

## Architecture
- React + TypeScript (strict) + Vite + vite-plugin-pwa.
- State: zustand. `store/tasks.store.ts` is persisted to IndexedDB via `store/idb.storage.ts`; `store/ui.store.ts` (view, date, open row, modal) is not persisted.
- Recurring tasks are stored as series + per-date occurrence state and materialized per day in `store/tasks.selectors.ts` — never store generated occurrences as tasks.
- Dates are local `YYYY-MM-DD` strings, times `HH:MM`; use `utils/date.utils.ts` / `utils/time.utils.ts`, no date libraries.
- Tunables live in `src/config/*.config.ts`, fixed value sets in `src/constants/*.constants.ts`. No magic numbers in components.

## UI rules
- UI comes exclusively from `e-ink-ui-lib`, imported only through `src/ui/index.ts`.
- App CSS is for layout only (grid/flex, spacing, positioning). No colors, fonts, borders or sizes beyond layout; use lib tokens (`var(--eink-*)`) where values are needed.
- A component the lib lacks is first built in `src/ui/candidates/<name>/` (the directory exists only while a candidate does; currently none) following the lib's conventions (`<name>.component.tsx`, `<name>.component.css` with `eink-` BEM + tokens only, `<name>.test.tsx`, OKF `README.md`, JSDoc), so it can be transferred to github.com/AlexisRoe/e-ink-ui-lib via PR; once released, bump the lib, remove the candidate and its export from `src/ui/index.ts` (see ADR 0013 for the last round).
- Typography: lib fonts only (Inter, JetBrains Mono). No external font or asset loading.
- No CSS transitions/animations (e-ink).

## File naming
Suffix states the purpose: `*.view.tsx`, `*.component.tsx`, `*.hook.ts`, `*.store.ts`, `*.selectors.ts`, `*.utils.ts`, `*.constants.ts`, `*.config.ts`, `*.types.ts`, tests `*.test.ts(x)` co-located. Lowercase, dash-separated.

## Documentation
- JSDoc on every exported type, interface, function, hook and component, describing purpose and intent, not internals.
- In-code comments only when absolutely necessary.
- Every architectural or tooling decision gets an ADR in `docs/decisions/NNNN-title.md`.

## Security (non-negotiable)
- No network calls, telemetry, CDNs or third-party origins. Keep `public/_headers` CSP strict; never loosen it to make something work.
- Never use `dangerouslySetInnerHTML`, `eval`, or `new Function`.
- Treat persisted data as untrusted: validate on hydrate; schema changes require a migration in `store/tasks.migrations.ts` and a bumped `SCHEMA_VERSION`.
- Validate and length-limit all user input.
- Adding a dependency requires justification in an ADR; pin exact versions; prefer none.
- GitHub Actions: pin actions to commit SHAs, least-privilege `permissions`.
- Never commit secrets (`.env*`, `.dev.vars`, Cloudflare tokens).

## Git
- Work on feature branches; `main` deploys to Cloudflare via GitHub Actions.
