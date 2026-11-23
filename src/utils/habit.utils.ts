import type { Habit, IsoDate } from "@/types/task.types";
import { compareIso } from "@/utils/date.utils";
import { occurrenceKey } from "@/utils/recurrence.utils";

/** Tells whether a habit is active on the given date, i.e. within `[startDate, endDate)`. */
export function isHabitActiveOn(habit: Habit, date: IsoDate): boolean {
  if (compareIso(date, habit.startDate) < 0) return false;
  return habit.endDate === null || compareIso(date, habit.endDate) < 0;
}

/** Tells whether a habit is still running, i.e. has not been deleted. */
export function isHabitRunning(habit: Habit): boolean {
  return habit.endDate === null;
}

/** Key identifying the check of one habit on one date in the habit-check map. */
export function habitCheckKey(habitId: string, date: IsoDate): string {
  return occurrenceKey(habitId, date);
}
