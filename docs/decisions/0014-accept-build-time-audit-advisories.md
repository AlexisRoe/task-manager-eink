# 0014. Accept build-time `npm audit` advisories until upstream fixes

Date: 2026-11-23 · Status: accepted

## Context
`npm audit` on 2026-11-23 reports 4 moderate advisories, all in the build-time chain `vite-plugin-pwa@2.0.0` → `workbox-build@7.4.1` → `glob@11.1.0` → `minimatch@10.2.6`:
- `glob` 9.0.0–14.0.1: AbortSignal cancellation bypass allows post-timeout filesystem traversal (GHSA-3g3m-2fjr-6pw4).
- `minimatch` 7.0.0–11.0.0: denial of service via globparts amplification (GHSA-g3hv-75wg-m249).
- `workbox-build` and `vite-plugin-pwa` are flagged only transitively.

`npm audit --omit=dev` reports 0 vulnerabilities. The packages run only while workbox generates the service-worker precache during `npm run build`; they are not shipped in the app. Their inputs are our own config and `dist/`, not attacker-controlled data, and the app makes no network requests.

The suggested `npm audit fix --force` would install `vite-plugin-pwa@1.1.0`, a breaking downgrade.

## Decision
Accept the risk for now and wait for an upstream fix (a `workbox-build` / `vite-plugin-pwa` release that depends on patched `glob` / `minimatch`). When one is published, bump with an exact pinned version and run `npm run check`. We do not use `npm audit fix --force` and do not add `overrides` for `glob` / `minimatch`, because overriding a major version inside `workbox-build` risks breaking service-worker generation.

`npm run security` uses `--audit-level=high`, so these moderate advisories do not fail it; any high or critical advisory still does.

## Consequences
- The audit stays at 4 moderate findings until upstream ships a fix.
- Re-run `npm audit` on each dependency update and when this ADR is revisited. Supersede this ADR once the fix lands, or sooner if an advisory is raised to high/critical or turns out to be reachable from production code.
