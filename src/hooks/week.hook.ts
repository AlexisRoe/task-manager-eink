import { useMemo } from "react";
import { selectDayHabits, selectDayTasks } from "@/store/tasks.selectors";
import { useTasksStore } from "@/store/tasks.store";
import type { DayHabit, DayTask, IsoDate } from "@/types/task.types";
import { weekDates } from "@/utils/date.utils";

/** One column of the week: its date, tasks and completion counts. */
export interface WeekDay {
  date: IsoDate;
  tasks: DayTask[];
  done: number;
  total: number;
}

/** The seven days (Monday to Sunday) of a week plus overall completion. */
export interface WeekData {
  days: WeekDay[];
  done: number;
  total: number;
}

/** Subscribes to the store and returns the tasks of the week containing `date`. */
export function useWeekData(date: IsoDate): WeekData {
  const tasks = useTasksStore((state) => state.tasks);
  const series = useTasksStore((state) => state.series);
  const occurrences = useTasksStore((state) => state.occurrences);
  return useMemo(() => {
    const data = { tasks, series, occurrences, carryDismissedOn: null };
    const days = weekDates(date).map((day) => {
      const dayTasks = selectDayTasks(data, day);
      return {
        date: day,
        tasks: dayTasks,
        done: dayTasks.filter((task) => task.done).length,
        total: dayTasks.length,
      };
    });
    return {
      days,
      done: days.reduce((sum, day) => sum + day.done, 0),
      total: days.reduce((sum, day) => sum + day.total, 0),
    };
  }, [tasks, series, occurrences, date]);
}

/** One column of the week's habits: its date, active habits and completion counts. */
export interface WeekHabitDay {
  date: IsoDate;
  habits: DayHabit[];
  done: number;
  total: number;
}

/** The seven days of a week with their habits plus overall completion. */
export interface WeekHabitData {
  days: WeekHabitDay[];
  done: number;
  total: number;
}

/** Subscribes to the store and returns the habits of the week containing `date`. */
export function useWeekHabitData(date: IsoDate): WeekHabitData {
  const habits = useTasksStore((state) => state.habits);
  const habitChecks = useTasksStore((state) => state.habitChecks);
  return useMemo(() => {
    const days = weekDates(date).map((day) => {
      const dayHabits = selectDayHabits({ habits, habitChecks }, day);
      return {
        date: day,
        habits: dayHabits,
        done: dayHabits.filter((habit) => habit.done).length,
        total: dayHabits.length,
      };
    });
    return {
      days,
      done: days.reduce((sum, day) => sum + day.done, 0),
      total: days.reduce((sum, day) => sum + day.total, 0),
    };
  }, [habits, habitChecks, date]);
}
