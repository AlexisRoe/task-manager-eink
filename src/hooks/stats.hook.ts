import { useMemo } from "react";
import { STATS_WEEKS, STATS_WINDOW_DAYS } from "@/config/stats.config";
import { DAYS_PER_WEEK } from "@/constants/date.constants";
import { PRIORITIES, PROJECTS } from "@/constants/task.constants";
import { selectDayTasks } from "@/store/tasks.selectors";
import { useTasksStore } from "@/store/tasks.store";
import type { DayTask, IsoDate } from "@/types/task.types";
import { addDays, compareIso, startOfWeek } from "@/utils/date.utils";
import { isHabitRunning } from "@/utils/habit.utils";
import { type DayStats, historyWeekStarts } from "@/utils/history.utils";
import {
  groupRates,
  type HabitStreak,
  habitStreak,
  percent,
  weekdayRates,
  weeklyTotals,
} from "@/utils/stats.utils";

/** Everything the Stats view shows. */
export interface StatsData {
  /** Completion percentage of tasks in the measured window. */
  rate: number;
  /** Tasks finished in the current week. */
  doneThisWeek: number;
  /** Longest current streak among running habits. */
  bestStreak: number;
  /** Streaks of the running habits. */
  habits: HabitStreak[];
  /** Mondays of the weeks in the trend, oldest first. */
  weekStarts: IsoDate[];
  /** Task totals per week, aligned with `weekStarts`. */
  weekly: DayStats[];
  /** Completion percentage per weekday, Monday first. */
  weekday: number[];
  /** Completion percentage per project, in `PROJECTS` order. */
  byProject: number[];
  /** Completion percentage per priority, High first. */
  byPriority: number[];
}

/** Subscribes to the store and derives all statistics up to and including `today`. */
export function useStatsData(today: IsoDate): StatsData {
  const tasks = useTasksStore((state) => state.tasks);
  const series = useTasksStore((state) => state.series);
  const occurrences = useTasksStore((state) => state.occurrences);
  const habits = useTasksStore((state) => state.habits);
  const habitChecks = useTasksStore((state) => state.habitChecks);
  return useMemo(() => {
    const weekStarts = historyWeekStarts(today, STATS_WEEKS);
    const first = weekStarts[0] ?? today;
    const data = { tasks, series, occurrences, carryDismissedOn: null };
    const stats = new Map<IsoDate, DayStats>();
    const all: DayTask[] = [];
    for (let date = first; compareIso(date, today) <= 0; date = addDays(date, 1)) {
      const day = selectDayTasks(data, date);
      if (day.length === 0) continue;
      stats.set(date, { total: day.length, done: day.filter((t) => t.done).length });
      all.push(...day);
    }
    const windowStart = addDays(today, -(STATS_WINDOW_DAYS - 1));
    const windowStats = { total: 0, done: 0 };
    for (const [date, day] of stats) {
      if (compareIso(date, windowStart) < 0) continue;
      windowStats.total += day.total;
      windowStats.done += day.done;
    }
    const weekly = weeklyTotals(stats, weekStarts);
    const streaks = habits
      .filter(isHabitRunning)
      .map((habit) => habitStreak(habit, habitChecks, today, STATS_WINDOW_DAYS));
    const thisWeek = startOfWeek(today);
    const doneThisWeek = [...stats]
      .filter(
        ([date]) =>
          compareIso(date, thisWeek) >= 0 && compareIso(date, addDays(thisWeek, DAYS_PER_WEEK)) < 0,
      )
      .reduce((sum, [, day]) => sum + day.done, 0);
    return {
      rate: percent(windowStats),
      doneThisWeek,
      bestStreak: Math.max(0, ...streaks.map((s) => s.current)),
      habits: streaks,
      weekStarts,
      weekly,
      weekday: weekdayRates(stats),
      byProject: groupRates(all, PROJECTS.length, (t) => PROJECTS.indexOf(t.project)),
      byPriority: groupRates(all, PRIORITIES.length, (t) => t.priority - 1),
    };
  }, [tasks, series, occurrences, habits, habitChecks, today]);
}
