import { useMemo } from "react";
import { selectDayTasks } from "@/store/tasks.selectors";
import { useTasksStore } from "@/store/tasks.store";
import type { DayTask, IsoDate } from "@/types/task.types";
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
