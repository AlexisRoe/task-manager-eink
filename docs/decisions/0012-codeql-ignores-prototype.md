# 0012 CodeQL ignores the prototype

## Status
Accepted

## Context
`prototype/` holds the original design prototype, kept only as a visual and behavioural reference. It is never built, bundled or deployed. CodeQL reported one high and four medium findings in `prototype/Daybook Planner.html` (DOM XSS, cross-window messaging), which is exactly the code the reimplementation replaced.

## Decision
Exclude `prototype/` from CodeQL via `.github/codeql-config.yml` (`paths-ignore`). All shipped code (`src/`, `plugins/`, config) stays analysed.

## Consequences
PR checks reflect the code that ships. If the prototype is ever promoted into the build, remove the exclusion.
