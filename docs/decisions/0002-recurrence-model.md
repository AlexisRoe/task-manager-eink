# 0002. Recurring tasks are series plus per-date occurrence state

Date: 2026-11-19 · Status: accepted

## Context
Daily, weekday and weekly tasks must appear on many days, be completable per day and be deletable for one day or for all future days.

## Decision
Store a `RecurringSeries` (rule, anchor date, optional end date) and an `OccurrenceState` per `<seriesId>:<date>` (done, skipped). Occurrences are materialized per day in `store/tasks.selectors.ts` and are never stored as tasks. Deleting 'this and future days' sets `endDate` to the previous day, or drops the series if nothing remains. Moving an occurrence to tomorrow skips it and creates a one-off copy.

## Consequences
Storage stays tiny and edits are cheap. Past occurrences of an ended series remain visible. Every day view derives its tasks, so selectors are memoized in hooks.
