# 0016. Portrait orientation support

Date: 2026-11-23 · Status: accepted · Supersedes the landscape part of [0008](0008-standalone-gate.md)

## Context
Daybook locked the manifest to landscape and showed a "rotate device" screen in portrait. Tablets are also used upright.

## Decision
The manifest uses `orientation: "any"` and `StandaloneGate` only enforces standalone display. Layout adapts through `@media (orientation: portrait)` rules (landscape and portrait only, no width breakpoints):
- Header: three rows (brand and "New task", full-width view switch, date navigation).
- Day: one pane at a time, switched with a "List" `Toggle` at the end of the heading line (on = list, the default; off = timeline); see also [ADR 0020](0020-week-view-habits-switch.md) for the matching Week switch. `useIsPortrait` (`hooks/orientation.hook.ts`) drives it because the choice needs state.
- Week: seven stacked day rows that grow to show every task; the view scrolls.
- History: one pane at a time, switched with a "Heatmaps" `Toggle` at the end of the heading line (on = heatmaps, the default; off = selected day). Selecting a heatmap cell switches to the Day pane so the choice gives immediate feedback.

## Consequences
Landscape layouts are unchanged. Layout rules are CSS-only except the Day pane toggle; jsdom cannot verify them, so they need a manual check in both orientations.
