# 0010. Extract the library's inline fonts at build time

Date: 2026-11-19 · Status: accepted

## Context
`e-ink-ui-lib` ships its fonts as base64 `data:` URIs inside its CSS (3 MB). That would require `font-src data:` in the CSP and exceeds the service worker precache limit.

## Decision
A small Vite build plugin (`plugins/extract-inline-fonts.plugin.ts`) rewrites those URIs to emitted font files under `/assets/fonts/`.

## Consequences
The CSP stays strict, the CSS shrinks to ~94 kB and the fonts are precached. The plugin can be removed once the library emits font files itself.
