# Daybook

A local-only, landscape, standalone-only task planner PWA for e-ink tablets. Data lives in IndexedDB on the device; the app makes no network requests.

- Intent: `CONCEPT.md` · Roadmap: `PLAN.md` · Conventions: `CLAUDE.md` · Decisions: `docs/decisions/`

## Setup
```sh
nvm use          # Node from .nvmrc
npm ci           # never plain `npm install` unless changing the lockfile
npm run dev
```

## Scripts
| Script | Purpose |
|---|---|
| `npm run dev` / `build` / `preview` | Dev server, production build, preview of the build |
| `npm test` / `test:watch` / `coverage` | Vitest (coverage thresholds enforced) |
| `npm run lint` / `lint:fix` / `format` | Biome |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run security` | `npm audit` (high) + signature check |
| `npm run check` | lint + typecheck + coverage + build — run before finishing any change |

## Architecture
- `src/store` zustand stores (tasks persisted to IndexedDB, UI state transient), selectors materialize recurring occurrences per day.
- `src/utils` pure date/time/recurrence/history/validation helpers; `src/config` tunables; `src/constants` fixed value sets.
- `src/views` Day, Week and History views; `src/components` shared pieces and modals; `src/hooks` store-derived data.
- `src/ui/index.ts` is the only UI import point: `e-ink-ui-lib` plus local candidates in `src/ui/candidates/` that are meant to be upstreamed.
- In development the store is filled with demo data (`src/dev/seed.fixture.ts`) when empty.

## Security
See `SECURITY.md`. No third-party origins, strict CSP in `public/_headers`, validated persisted data, pinned dependencies and GitHub Actions.

## Deployment
Merging to `main` runs `.github/workflows/deploy.yml`: `npm run check`, then `wrangler deploy` (static assets from `dist/`, SPA fallback in `wrangler.jsonc`). Requires the `production` environment and a project-scoped `CLOUDFLARE_API_TOKEN` secret.

Set up branch protection on `main` yourself: require the `PR` checks (`check`, `dependency-review`, `secret-scan`) and `CodeQL`, require review, block force pushes.
