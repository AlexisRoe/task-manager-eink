# 0001. Persist tasks in IndexedDB via zustand persist

Date: 2026-11-19 · Status: accepted

## Context
All data must stay on the device. localStorage is synchronous, small and string-only; the app needs to survive restarts and hold years of history.

## Decision
Use zustand's `persist` middleware with an IndexedDB-backed storage (`idb-keyval`, `store/idb.storage.ts`). Persisted data is validated and migrated on load (`store/tasks.migrations.ts`); unreadable data is reset and the user is told. `navigator.storage.persist()` is requested at startup.

## Consequences
One small runtime dependency (`idb-keyval`). Hydration is asynchronous, so the app renders nothing until it finishes. Schema changes require a bumped `SCHEMA_VERSION` and a migration.
