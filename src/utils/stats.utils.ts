import { STATS_FLAG_MIN_DAYS } from "@/config/stats.config";
import { DAYS_PER_WEEK } from "@/constants/date.constants";
import type { Habit, IsoDate } from "@/types/task.types";
import { addDays, compareIso, weekdayIndex } from "@/utils/date.utils";
import { habitCheckKey } from "@/utils/habit.utils";
import type { DayStats, StatsByDate } from "@/utils/history.utils";

const PERCENT = 100;
const EMPTY: DayStats = { total: 0, done: 0 };

/** Rounded completion percentage; `0` when nothing was planned. */
export function percent({ total, done }: DayStats): number {
  return total === 0 ? 0 : Math.round((done / total) * PERCENT);
}

/** Streak figures of one habit. */
export interface HabitStreak {
  id: string;
  title: string;
  /** Consecutive done days up to today; an unchecked today does not break it yet. */
  current: number;
  /** Longest run of consecutive done days since the habit started. */
  longest: number;
  /** Completion percentage within the measured window. */
  rate: number;
  /** "always" when done on every active day of the window, "never" when on none. */
  flag: "always" | "never" | null;
}

/** Computes streaks, window rate and the always/never flag of a habit as of `today`. */
export function habitStreak(
  habit: Habit,
  checks: Readonly<Record<string, true>>,
  today: IsoDate,
  windowDays: number,
): HabitStreak {
  const lastDay =
    habit.endDate !== null && compareIso(addDays(habit.endDate, -1), today) < 0
      ? addDays(habit.endDate, -1)
      : today;
  const windowStart = addDays(today, -(windowDays - 1));
  let run = 0;
  let longest = 0;
  const windowStats = { total: 0, done: 0 };
  for (let date = habit.startDate; compareIso(date, lastDay) <= 0; date = addDays(date, 1)) {
    const done = checks[habitCheckKey(habit.id, date)] === true;
    if (!done && date === today) continue;
    run = done ? run + 1 : 0;
    longest = Math.max(longest, run);
    if (compareIso(date, windowStart) >= 0) {
      windowStats.total += 1;
      if (done) windowStats.done += 1;
    }
  }
  const enough = windowStats.total >= STATS_FLAG_MIN_DAYS;
  let flag: HabitStreak["flag"] = null;
  if (enough && windowStats.done === windowStats.total) flag = "always";
  else if (enough && windowStats.done === 0) flag = "never";
  return {
    id: habit.id,
    title: habit.title,
    current: run,
    longest,
    rate: percent(windowStats),
    flag,
  };
}

/** Sums day statistics per week, one entry per Monday in `weekStarts`. */
export function weeklyTotals(stats: StatsByDate, weekStarts: readonly IsoDate[]): DayStats[] {
  return weekStarts.map((monday) => {
    const week = { total: 0, done: 0 };
    for (let offset = 0; offset < DAYS_PER_WEEK; offset += 1) {
      const day = stats.get(addDays(monday, offset)) ?? EMPTY;
      week.total += day.total;
      week.done += day.done;
    }
    return week;
  });
}

/** Completion percentage per weekday (Monday first) over all days in `stats`. */
export function weekdayRates(stats: StatsByDate): number[] {
  const sums = Array.from({ length: DAYS_PER_WEEK }, () => ({ total: 0, done: 0 }));
  for (const [date, day] of stats) {
    const sum = sums[weekdayIndex(date)];
    if (sum === undefined) continue;
    sum.total += day.total;
    sum.done += day.done;
  }
  return sums.map(percent);
}

/** Completion percentage of `items` grouped into `groups` by `groupOf` (index into `groups`). */
export function groupRates<T extends { done: boolean }>(
  items: readonly T[],
  groups: number,
  groupOf: (item: T) => number,
): number[] {
  const sums = Array.from({ length: groups }, () => ({ total: 0, done: 0 }));
  for (const item of items) {
    const sum = sums[groupOf(item)];
    if (sum === undefined) continue;
    sum.total += 1;
    if (item.done) sum.done += 1;
  }
  return sums.map(percent);
}
