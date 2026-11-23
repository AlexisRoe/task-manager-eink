# 0020 Week view: Habits switch

## Status
Accepted. Refines [ADR 0017](0017-daily-habits.md), which kept habits out of the Week view.

## Context
Habits are checked day by day, so the weekly overview is a natural place to see a week of them at a glance. Mixing them into the task columns would blur task progress and counts.

## Decision
- A `Toggle` labelled "Habits" sits at the end of the heading line (week number, date range, "x of y done"), in both orientations. Off (default) shows tasks, on shows habits.
- The switch only swaps the data: layout, day headers, progress bars and the "x of y done" counter stay the same, but count only the chosen kind.
- Habit rows have no time and are disabled for future days, as in the Day view.
- `WeekColumn` takes generic checkable items so tasks and habits share one component; `useWeekHabitData` mirrors `useWeekData`.

## Consequences
Habits and tasks are still never counted together. The choice is local view state and resets when the view is reopened. A Segmented pane switch, as used by Day, History and Stats in portrait, was dropped here to keep the view identical in both orientations.
