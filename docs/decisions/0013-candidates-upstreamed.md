# 0013. Candidates upstreamed to e-ink-ui-lib 1.2.0

Date: 2026-11-19 · Status: accepted

## Context
ADR 0004 required the Heatmap, Inverted, TimeGrid and controlled Segmented candidates to be transferred to the library once the app was deployed.

## Decision
`e-ink-ui-lib` 1.2.0 ships all four (Segmented as a `value` prop on the existing component). The app pins `1.2.0` and `src/ui/candidates/` is deleted; `src/ui/index.ts` now only re-exports the library. The candidate workflow itself stays available for future gaps.

## Consequences
No app code changed, since all imports go through `src/ui/index.ts`. The library's Node engine requirement (>=24.17.0) matches `.nvmrc` and `package.json`.
