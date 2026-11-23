import type { TasksData } from "@/store/tasks.store";
import type { DayHabit, DayTask, IsoDate, Task } from "@/types/task.types";
import { addDays, compareIso } from "@/utils/date.utils";
import { habitCheckKey, isHabitActiveOn, isHabitRunning } from "@/utils/habit.utils";
import type { DayStats, StatsByDate } from "@/utils/history.utils";
import { occurrenceKey, occursOn } from "@/utils/recurrence.utils";
import { toMinutes } from "@/utils/time.utils";

/** Task data of the store, the only part task selectors depend on; habits are kept apart. */
export type TaskListData = Omit<TasksData, "habits" | "habitChecks">;

function compareDayTasks(a: DayTask, b: DayTask): number {
  if (a.start !== null && b.start !== null) {
    return toMinutes(a.start) - toMinutes(b.start) || a.priority - b.priority;
  }
  if (a.start !== null) return -1;
  if (b.start !== null) return 1;
  return a.priority - b.priority || a.title.localeCompare(b.title);
}

/**
 * Builds the tasks of one day: one-off tasks plus occurrences of recurring series, scheduled
 * tasks first by start time, then "Anytime" tasks by priority. Occurrences are derived here
 * and never stored.
 */
export function selectDayTasks(data: TaskListData, date: IsoDate): DayTask[] {
  const result: DayTask[] = [];
  for (const task of data.tasks) {
    if (task.date !== date) continue;
    const { id, done, carriedOver, start, durationMin, priority, project, notes, title } = task;
    result.push({
      id,
      date,
      done,
      carriedOver,
      start,
      durationMin,
      priority,
      project,
      notes,
      title,
      source: "task",
      rule: null,
    });
  }
  for (const series of data.series) {
    if (!occursOn(series, date)) continue;
    const state = data.occurrences[occurrenceKey(series.id, date)];
    if (state?.skipped) continue;
    const { id, start, durationMin, priority, project, notes, title, rule } = series;
    result.push({
      id,
      date,
      start,
      durationMin,
      priority,
      project,
      notes,
      title,
      rule,
      done: state?.done ?? false,
      carriedOver: false,
      source: "series",
    });
  }
  return result.sort(compareDayTasks);
}

/** Counts total and finished tasks of one day. */
export function selectDayStats(data: TaskListData, date: IsoDate): DayStats {
  const tasks = selectDayTasks(data, date);
  return { total: tasks.length, done: tasks.filter((t) => t.done).length };
}

/** Collects statistics for every date between `from` and `to` (inclusive) that has tasks. */
export function selectStatsByDate(data: TaskListData, from: IsoDate, to: IsoDate): StatsByDate {
  const stats = new Map<IsoDate, DayStats>();
  for (let date = from; compareIso(date, to) <= 0; date = addDays(date, 1)) {
    const day = selectDayStats(data, date);
    if (day.total > 0) stats.set(date, day);
  }
  return stats;
}

/** One-off tasks from yesterday that are still open and can be carried over to today. */
export function selectCarryOverCandidates(data: TaskListData, today: IsoDate): Task[] {
  const yesterday = addDays(today, -1);
  return data.tasks.filter((t) => t.date === yesterday && !t.done);
}

/** Tells whether the carry-over banner should be shown for `today`. */
export function selectShowCarryOver(data: TaskListData, today: IsoDate, enabled: boolean): boolean {
  if (!enabled || data.carryDismissedOn === today) return false;
  return selectCarryOverCandidates(data, today).length > 0;
}

/** Habit data of the store, the only part habit selectors depend on. */
export type HabitsData = Pick<TasksData, "habits" | "habitChecks">;

/** Builds the habits active on one day with their done state, oldest habit first. */
export function selectDayHabits(data: HabitsData, date: IsoDate): DayHabit[] {
  return data.habits
    .filter((habit) => isHabitActiveOn(habit, date))
    .sort((a, b) => compareIso(a.startDate, b.startDate) || a.title.localeCompare(b.title))
    .map(({ id, title }) => ({
      id,
      title,
      date,
      done: data.habitChecks[habitCheckKey(id, date)] === true,
    }));
}

/** Counts the habits that are still running, the number limited by `HABITS_MAX_ACTIVE`. */
export function selectActiveHabitCount(data: HabitsData): number {
  return data.habits.filter(isHabitRunning).length;
}

/** Collects habit completion for every date between `from` and `to` (inclusive) that has habits. */
export function selectHabitStatsByDate(data: HabitsData, from: IsoDate, to: IsoDate): StatsByDate {
  const stats = new Map<IsoDate, DayStats>();
  for (let date = from; compareIso(date, to) <= 0; date = addDays(date, 1)) {
    const habits = selectDayHabits(data, date);
    if (habits.length > 0) {
      stats.set(date, { total: habits.length, done: habits.filter((h) => h.done).length });
    }
  }
  return stats;
}

/** Looks up the recurring series a day task originates from. */
export function selectSeries(data: TaskListData, seriesId: string) {
  return data.series.find((s) => s.id === seriesId);
}
