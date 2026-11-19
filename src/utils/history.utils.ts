import {
  HEATMAP_THRESHOLDS,
  type HeatmapLevel,
  RECENT_DAYS,
  STREAK_MIN_RATIO,
} from "@/constants/history.constants";
import type { IsoDate } from "@/types/task.types";
import { addDays, startOfWeek, weekDates } from "@/utils/date.utils";

/** Completion numbers of a single day. */
export interface DayStats {
  total: number;
  done: number;
}

/** Lookup of day statistics by date; days without tasks may be absent. */
export type StatsByDate = ReadonlyMap<IsoDate, DayStats>;

const EMPTY_STATS: DayStats = { total: 0, done: 0 };

function statsFor(stats: StatsByDate, date: IsoDate): DayStats {
  return stats.get(date) ?? EMPTY_STATS;
}

/** Maps a day's completion to a heatmap intensity level (0 = no tasks, 5 = all done). */
export function heatmapLevel({ total, done }: DayStats): HeatmapLevel {
  if (total === 0) return 0;
  const ratio = done / total;
  let level: HeatmapLevel = 1;
  HEATMAP_THRESHOLDS.forEach((threshold, index) => {
    if (ratio >= threshold) level = (index + 2) as HeatmapLevel;
  });
  return level;
}

/** Returns the Mondays of the `weeks` weeks ending with the week of `today`, oldest first. */
export function historyWeekStarts(today: IsoDate, weeks: number): IsoDate[] {
  const currentMonday = startOfWeek(today);
  return Array.from({ length: weeks }, (_, index) =>
    addDays(currentMonday, (index - weeks + 1) * 7),
  );
}

/** Counts consecutive days before `today` on which at least 75 % of ≥ 1 tasks were done. */
export function computeStreak(stats: StatsByDate, today: IsoDate): number {
  let streak = 0;
  let cursor = addDays(today, -1);
  for (;;) {
    const day = statsFor(stats, cursor);
    if (day.total === 0 || day.done / day.total < STREAK_MIN_RATIO) return streak;
    streak += 1;
    cursor = addDays(cursor, -1);
  }
}

/** Sums tasks done during the last 30 days, excluding today. */
export function doneInRecentDays(stats: StatsByDate, today: IsoDate): number {
  let sum = 0;
  for (let offset = 1; offset <= RECENT_DAYS; offset += 1) {
    sum += statsFor(stats, addDays(today, -offset)).done;
  }
  return sum;
}

/** Average completion ratio (0–1) across days with tasks from `weekStarts` up to and including today. */
export function averageCompletion(
  stats: StatsByDate,
  weekStarts: readonly IsoDate[],
  today: IsoDate,
): number {
  let sum = 0;
  let days = 0;
  for (const monday of weekStarts) {
    for (const date of weekDates(monday)) {
      if (date > today) continue;
      const day = statsFor(stats, date);
      if (day.total === 0) continue;
      sum += day.done / day.total;
      days += 1;
    }
  }
  return days === 0 ? 0 : sum / days;
}
