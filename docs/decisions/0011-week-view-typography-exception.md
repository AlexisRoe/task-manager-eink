# 11. Typography and border overrides in the Week view

Date: 2026-11-19 · Status: accepted

## Context
CLAUDE.md limits app CSS to layout. The Week view's today column renders badly with layout-only CSS: the library's default body font (JetBrains Mono) made task titles monospaced, unlike the reference screenshot (`screenshots/weekly-view.png`), which uses Inter for titles and a mono face for times, with a large day number. Separately, the theme resolves `--eink-border-*` at `:root`, so inverting only the colour tokens left checkbox and progress-bar borders black on the black column.

## Decision
- The owner explicitly allowed overriding CSS for this case. `week.view.css` sets `font-family` (library font tokens only) and two `font-size` tokens on the day number and item times.
- The border problem is fixed inside the `Inverted` candidate (`inverted.component.css`), which now re-declares the `--eink-border-*` tokens in its scope. This stays within the candidate conventions and should be upstreamed with it.
- No colours, borders or sizes are hard-coded; only `var(--eink-*)` tokens are used.

## Consequences
The Week view matches the reference more closely. Other views are unchanged and keep the library default fonts; if they should follow the same typography, this decision should be extended there. Remove the font overrides if the library changes its default body font.
