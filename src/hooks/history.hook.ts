import { useMemo } from "react";
import { DAYS_PER_WEEK } from "@/constants/date.constants";
import { HISTORY_WEEKS } from "@/constants/history.constants";
import { selectHabitStatsByDate, selectStatsByDate } from "@/store/tasks.selectors";
import { useTasksStore } from "@/store/tasks.store";
import type { IsoDate } from "@/types/task.types";
import { addDays } from "@/utils/date.utils";
import { type DayStats, historyWeekStarts } from "@/utils/history.utils";

/** Everything the History view shows: the task and habit week grids. */
export interface HistoryData {
  /** Mondays of the shown weeks, oldest first. */
  weekStarts: IsoDate[];
  /** Completion numbers per date that has tasks. */
  stats: ReadonlyMap<IsoDate, DayStats>;
  /** Habit completion numbers per date that has active habits. */
  habitStats: ReadonlyMap<IsoDate, DayStats>;
}

/** Subscribes to the store and derives history statistics ending with the week of `today`. */
export function useHistoryData(today: IsoDate): HistoryData {
  const tasks = useTasksStore((state) => state.tasks);
  const series = useTasksStore((state) => state.series);
  const occurrences = useTasksStore((state) => state.occurrences);
  const habits = useTasksStore((state) => state.habits);
  const habitChecks = useTasksStore((state) => state.habitChecks);
  return useMemo(() => {
    const weekStarts = historyWeekStarts(today, HISTORY_WEEKS);
    const first = weekStarts[0] ?? today;
    const last = addDays(weekStarts[weekStarts.length - 1] ?? today, DAYS_PER_WEEK - 1);
    const stats = selectStatsByDate(
      { tasks, series, occurrences, carryDismissedOn: null },
      first,
      last,
    );
    return {
      weekStarts,
      stats,
      habitStats: selectHabitStatsByDate({ habits, habitChecks }, first, last),
    };
  }, [tasks, series, occurrences, habits, habitChecks, today]);
}
