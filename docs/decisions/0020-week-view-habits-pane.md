# 0020 Week view: Tasks / Habits toggle in portrait

## Status
Accepted. Refines [ADR 0017](0017-daily-habits.md), which kept habits out of the Week view.

## Context
Habits are checked day by day, so the weekly overview is a natural place to see a week of them at a glance. Mixing them into the task columns would blur task progress and counts.

## Decision
- In portrait, the Week view gets a `Segmented` toggle (Tasks | Habits), following the pane pattern of the Day, History and Stats views. Tasks is the default.
- The toggle only swaps the data: the layout, day headers, progress bar and "x of y done" counter stay the same, but count only the chosen kind.
- Habit rows have no time and are disabled for future days, as in the Day view.
- Landscape is unchanged and shows tasks only.
- `WeekColumn` takes generic checkable items so tasks and habits share one component; `useWeekHabitData` mirrors `useWeekData`.

## Consequences
Habits and tasks are still never counted together. The choice is local view state and resets when the view is reopened.
