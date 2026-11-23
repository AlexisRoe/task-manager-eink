# 0018. Stats view

Date: 2026-11-23 · Status: accepted

## Context
History looks back at single days (heatmaps and a drill-down), but nothing shows trends or numbers: habit streaks, weekly progress, which weekday or project goes best. ADR 0017 left "a habit streak" as a possible follow-up.

## Decision
- **Fourth view "Stats" next to History**, which stays unchanged. The date navigation is hidden for it, like in History.
- **Content:** a headline row (completion rate of the last 30 days, tasks done this week, best current habit streak), a habit table (current streak, longest streak, 30-day rate, and an "Always" / "Never" flag), and charts for tasks per week (12 weeks, with a trend against the previous week), completion by weekday, by project and by priority.
- **Pure derivation.** All numbers come from `utils/stats.utils.ts` and are assembled in `hooks/stats.hook.ts` from the existing selectors. Nothing new is stored, so there is no schema change. Tunables are in `config/stats.config.ts`.
- **Habits** are exact, since every check-in is stored per date. An unchecked *today* neither breaks a streak nor counts against the rate. The "Always" / "Never" flags need at least 7 active days in the window.
- **Layout:** landscape shows habits on the left and charts on the right. Portrait keeps the headline row and splits the rest into habits and tasks, switched with a "Habits" `Toggle` at the end of the heading line (on = habits, the default; off = tasks).
- No new dependency; charts, table, pill and value are lib components.

## Consequences
Task numbers are "as the data stands now". Tasks have no completion timestamp, a task moved to tomorrow leaves its original day, and editing a series changes project and priority for all its past occurrences. Future tasks are not counted, and ended habits are not listed.
