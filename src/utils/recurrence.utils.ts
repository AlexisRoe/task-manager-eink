import type { IsoDate, OccurrenceState, RecurringSeries } from "@/types/task.types";
import { addDays, compareIso, weekdayIndex } from "@/utils/date.utils";

const WEEKEND_START_INDEX = 5;

/** Tells whether a series produces an occurrence on the given date (ignoring skipped state). */
export function occursOn(series: RecurringSeries, date: IsoDate): boolean {
  if (compareIso(date, series.anchorDate) < 0) return false;
  if (series.endDate !== null && compareIso(date, series.endDate) > 0) return false;
  switch (series.rule) {
    case "daily":
      return true;
    case "weekdays":
      return weekdayIndex(date) < WEEKEND_START_INDEX;
    case "weekly":
      return weekdayIndex(date) === weekdayIndex(series.anchorDate);
  }
}

/** Key identifying one occurrence of a series in the occurrence-state map. */
export function occurrenceKey(seriesId: string, date: IsoDate): string {
  return `${seriesId}:${date}`;
}

/** Default state of an occurrence that has not been touched yet. */
export const EMPTY_OCCURRENCE: OccurrenceState = { done: false, skipped: false };

/**
 * Ends a series the day before `date`; returns `null` when nothing of the series would remain,
 * so the caller can drop it.
 */
export function endSeriesBefore(series: RecurringSeries, date: IsoDate): RecurringSeries | null {
  const endDate = addDays(date, -1);
  if (compareIso(endDate, series.anchorDate) < 0) return null;
  return { ...series, endDate };
}
