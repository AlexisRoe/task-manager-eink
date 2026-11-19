# 0009. Dependency set

Date: 2026-11-19 · Status: accepted

## Context
CLAUDE.md requires every dependency to be justified.

## Decision
Runtime: `react`, `react-dom` (UI), `zustand` (state), `idb-keyval` (IndexedDB), `e-ink-ui-lib` (components). Dev: `typescript`, `vite`, `@vitejs/plugin-react`, `vite-plugin-pwa` (service worker and manifest), `vitest` with `@vitest/coverage-v8`, `jsdom`, `fake-indexeddb`, `@testing-library/*`, `@biomejs/biome`, and type packages. `npm audit` reports moderate findings in `glob`/`minimatch` inside `workbox-build` (build time only, not shipped); the CI gate fails on high severity or above.

## Consequences
Re-evaluate when `vite-plugin-pwa` or `workbox-build` ships a fixed release. Deployment uses the pinned `cloudflare/wrangler-action`, so `wrangler` is not a dependency.
