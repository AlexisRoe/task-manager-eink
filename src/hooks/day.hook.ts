import { useMemo } from "react";
import { selectDayTasks } from "@/store/tasks.selectors";
import { useTasksStore } from "@/store/tasks.store";
import type { DayTask, IsoDate } from "@/types/task.types";

/** Tasks of one day split into scheduled and "Anytime", with completion counts. */
export interface DayData {
  tasks: DayTask[];
  scheduled: DayTask[];
  anytime: DayTask[];
  done: number;
  total: number;
}

/** Subscribes to the store and returns the materialized, sorted tasks of the given day. */
export function useDayData(date: IsoDate): DayData {
  const tasks = useTasksStore((state) => state.tasks);
  const series = useTasksStore((state) => state.series);
  const occurrences = useTasksStore((state) => state.occurrences);
  return useMemo(() => {
    const all = selectDayTasks({ tasks, series, occurrences, carryDismissedOn: null }, date);
    return {
      tasks: all,
      scheduled: all.filter((task) => task.start !== null),
      anytime: all.filter((task) => task.start === null),
      done: all.filter((task) => task.done).length,
      total: all.length,
    };
  }, [tasks, series, occurrences, date]);
}
