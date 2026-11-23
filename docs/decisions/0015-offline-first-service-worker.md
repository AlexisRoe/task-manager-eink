# 0015. Register the service worker at startup and update automatically

Date: 2026-11-23 · Status: accepted

## Context
The app did not start without a connection. The service worker was registered by `useRegisterSW` inside `UpdatePrompt`, which only rendered behind `StandaloneGate` (ADR 0008). In a normal browser tab the gate blocks the planner, so no worker was registered and nothing was cached; the install path therefore never produced an offline-capable app. Updates also required a manual "Reload" (`registerType: "prompt"`).

## Decision
- `registerServiceWorker()` (`utils/service-worker.utils.ts`) runs from `main.tsx`, before and independent of any gate.
- `registerType: "autoUpdate"`: new workers `skipWaiting` + `clientsClaim`, and the page reloads once when one takes over. Data lives in IndexedDB, so a reload loses nothing persisted.
- A running app calls `registration.update()` when the browser fires `online` and every `UPDATE_CHECK_INTERVAL_MS`.
- The update banner (`UpdatePrompt`, `usePwaUpdate`) is removed; it can no longer be triggered.

- Registration is done by our own code, not the generated `virtual:pwa-register`: the production CSP (`require-trusted-types-for 'script'`) blocks `serviceWorker.register("/sw.js")` with a plain string ("This document requires 'TrustedScriptURL' assignment"), which workbox-window does. We create a Trusted Types policy (`daybook-service-worker`) that only yields `/sw.js`. The CSP itself is unchanged. This only showed in production because dev/preview do not apply `_headers`.
- `workbox.inlineWorkboxRuntime: true`: the generated worker otherwise calls `importScripts("./workbox-*.js")` with a string, which the same Trusted Types rule blocks inside the worker, so the install fails and nothing is precached.

## Consequences
After the first online visit the whole app shell (JS, CSS, fonts, icons, `index.html` navigation fallback) is precached and starts offline. Reconnecting picks up new versions without user action. The CSP is unchanged.
