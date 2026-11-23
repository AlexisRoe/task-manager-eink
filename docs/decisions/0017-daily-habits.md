# 0017. Daily habits

Date: 2026-11-23 · Status: accepted

## Context
Users want daily habits: things with only a title that apply to every day, have no time, and can be checked off at any point during the day. No more than 7 may be active at once. Habits must be editable (title only) and deletable, get their own completion heatmap in History, and must not appear in the Week view.

## Decision
- **Separate entity, same persisted root.** `Habit { id, title, startDate, endDate }` and a sparse `habitChecks: Record<"habitId:date", true>` live in `PersistedTasks` next to tasks and series. That gives one hydrate, validate and migrate path, while habits stay a separate concept. They are not a `SeriesRule`, because they have no time, duration, priority or project, and reusing series would make every task view filter them out.
- **Schema v2.** `SCHEMA_VERSION` goes from 1 to 2, and migration 1 adds empty `habits` / `habitChecks`. Persisted habits are validated on hydrate (`isHabit`, and check values must be `true`).
- **Active range `[startDate, endDate)`.** A new habit starts *today*, regardless of the date being viewed, so it doesn't spread back into past history. Deleting sets `endDate` to today, so past check-ins and the heatmap stay unchanged and the slot frees up right away. A habit deleted on the day it started is removed along with its checks.
- **Limit enforced in the store.** `addHabit` refuses once `HABITS_MAX_ACTIVE` (7, `constants/habit.constants.ts`) running habits exist. The "New habit" button is also disabled at that point, but the store is the authority.
- **Kept apart from tasks.** Task selectors take `TaskListData`, which has no habit fields. So habits never appear in the Week view, the task heatmap, the task statistics, or the Day view's "x of y done" header. Their own selectors (`selectDayHabits`, `selectHabitStatsByDate`) reuse `DayStats` / `heatmapLevel` for the second heatmap.
- **Check-offs** are allowed today and on past days. On future days the checkbox is disabled.

Related fix: when migration fails, `persist.migrate` now passes the unusable data on unchanged instead of returning empty data. That way `merge` rejects it and the "could not be read" notice also appears for corrupt data from an older version.

## Consequences
Existing v1 data upgrades on load with no habits. Renaming a habit also changes its title on past days. The History statistics row stays tasks-only, and a habit streak could be added later from `habitStats`.
