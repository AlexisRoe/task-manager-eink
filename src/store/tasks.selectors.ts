import type { TasksData } from "@/store/tasks.store";
import type { DayTask, IsoDate, Task } from "@/types/task.types";
import { addDays, compareIso } from "@/utils/date.utils";
import type { DayStats, StatsByDate } from "@/utils/history.utils";
import { occurrenceKey, occursOn } from "@/utils/recurrence.utils";
import { toMinutes } from "@/utils/time.utils";

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
export function selectDayTasks(data: TasksData, date: IsoDate): DayTask[] {
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
export function selectDayStats(data: TasksData, date: IsoDate): DayStats {
  const tasks = selectDayTasks(data, date);
  return { total: tasks.length, done: tasks.filter((t) => t.done).length };
}

/** Collects statistics for every date between `from` and `to` (inclusive) that has tasks. */
export function selectStatsByDate(data: TasksData, from: IsoDate, to: IsoDate): StatsByDate {
  const stats = new Map<IsoDate, DayStats>();
  for (let date = from; compareIso(date, to) <= 0; date = addDays(date, 1)) {
    const day = selectDayStats(data, date);
    if (day.total > 0) stats.set(date, day);
  }
  return stats;
}

/** One-off tasks from yesterday that are still open and can be carried over to today. */
export function selectCarryOverCandidates(data: TasksData, today: IsoDate): Task[] {
  const yesterday = addDays(today, -1);
  return data.tasks.filter((t) => t.date === yesterday && !t.done);
}

/** Tells whether the carry-over banner should be shown for `today`. */
export function selectShowCarryOver(data: TasksData, today: IsoDate, enabled: boolean): boolean {
  if (!enabled || data.carryDismissedOn === today) return false;
  return selectCarryOverCandidates(data, today).length > 0;
}

/** Looks up the recurring series a day task originates from. */
export function selectSeries(data: TasksData, seriesId: string) {
  return data.series.find((s) => s.id === seriesId);
}
