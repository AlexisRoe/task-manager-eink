import { HEATMAP_THRESHOLDS, type HeatmapLevel } from "@/constants/history.constants";
import type { IsoDate } from "@/types/task.types";
import { addDays, startOfWeek } from "@/utils/date.utils";

/** Completion numbers of a single day. */
export interface DayStats {
  total: number;
  done: number;
}

/** Lookup of day statistics by date; days without tasks may be absent. */
export type StatsByDate = ReadonlyMap<IsoDate, DayStats>;

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
