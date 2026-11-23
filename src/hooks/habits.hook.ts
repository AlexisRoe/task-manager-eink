import { useCallback, useMemo } from "react";
import { selectActiveHabitCount, selectDayHabits } from "@/store/tasks.selectors";
import { useTasksStore } from "@/store/tasks.store";
import type { DayHabit, IsoDate } from "@/types/task.types";

/** Habits of one day with completion counts. */
export interface DayHabitsData {
  habits: DayHabit[];
  done: number;
  total: number;
}

/** Subscribes to the store and returns the habits active on the given day. */
export function useDayHabits(date: IsoDate): DayHabitsData {
  const habits = useTasksStore((state) => state.habits);
  const habitChecks = useTasksStore((state) => state.habitChecks);
  return useMemo(() => {
    const all = selectDayHabits({ habits, habitChecks }, date);
    return { habits: all, done: all.filter((h) => h.done).length, total: all.length };
  }, [habits, habitChecks, date]);
}

/** Subscribes to the store and returns how many habits are currently running. */
export function useActiveHabitCount(): number {
  const habits = useTasksStore((state) => state.habits);
  const habitChecks = useTasksStore((state) => state.habitChecks);
  return useMemo(() => selectActiveHabitCount({ habits, habitChecks }), [habits, habitChecks]);
}

/** Returns a handler that flips a habit's done state on the habit's day. */
export function useToggleHabit(): (habit: DayHabit) => void {
  const toggle = useTasksStore((state) => state.toggleHabit);
  return useCallback((habit: DayHabit) => toggle(habit.id, habit.date), [toggle]);
}

/** Stable key of a day habit, used to track which row is expanded. */
export function habitRowKey(habit: DayHabit): string {
  return `habit:${habit.id}:${habit.date}`;
}
