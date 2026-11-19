# 0003. Typography comes only from e-ink-ui-lib

Date: 2026-11-19 · Status: accepted

## Context
The prototype used Literata and IBM Plex loaded from Google Fonts, which conflicts with the no-network rule.

## Decision
Use only the library fonts (Inter, JetBrains Mono) and its Title/Text/Label components. No external font or asset loading.

## Consequences
Headings differ slightly from the prototype screenshots; the app makes no font requests.
