# 0004. Missing UI is built as candidates and upstreamed

Date: 2026-11-19 · Status: accepted (all four candidates upstreamed in ADR 0013)

## Context
The library lacks a controlled Segmented, a time grid, a heatmap and an inverted surface. App CSS may only do layout.

## Decision
Build them in `src/ui/candidates/<name>/` following library conventions (BEM `eink-` classes, tokens only, tests, OKF README, JSDoc). Only `src/ui/index.ts` is imported by app code and re-exports the library plus candidates, so a candidate is replaced by editing one line after upstreaming. A clearable `TimeInput` is not needed: the app controls the value and offers an 'Anytime' button.

## Consequences
Candidates must be transferred to AlexisRoe/e-ink-ui-lib by PR (stories, export from `src/index.ts`), released, then deleted here.
