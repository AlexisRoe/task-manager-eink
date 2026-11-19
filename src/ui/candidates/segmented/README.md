---
type: component
title: "Segmented (controlled)"
description: "Segmented control that can be driven by a `value` prop so the highlighted item follows navigation triggered elsewhere."
tags: [react, e-ink, ui-component, okf-v0.2, candidate]
resource: "src/ui/candidates/segmented/segmented.component.tsx"
version: "1.0.0"
created_by: "agent:claude-sonnet-5-5" (2026-11-19T00:00:00Z)
reviewed_by: "user:pending"
---

# Segmented (controlled)

> **OKF Concept Document** — Follows Open Knowledge Format (OKF v0.2). TypeScript interfaces, standard prop signatures, and JSDoc types are intentionally excluded. Refer to source files for API types.

---

## Key Features
- Same markup and look as the library `Segmented`; adds an optional `value` prop for controlled use
- When `value` is set, clicks only report through `onChange`; the parent decides the selection
- Uncontrolled behavior with `defaultId` is unchanged

---

## Code Conventions
- BEM classes prefixed `eink-segmented`; CSS is identical to the library component
- Uses `cx()` for class merging

---

## Primary Use Cases
- Top-level view switches that can also change from other controls (e.g. "Open this day")

---

## Limits & Restrictions
- 🚫 **No CSS Transitions / Animations**
- Upstream plan: merge the `value` prop into the library `Segmented` and delete this candidate

---

## Related Concepts
- Library component `Segmented` in `e-ink-ui-lib`
