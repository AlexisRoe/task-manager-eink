import { useCallback } from "react";
import { useTasksStore } from "@/store/tasks.store";
import { useUiStore } from "@/store/ui.store";
import type { DayTask } from "@/types/task.types";

/** Handlers that apply user actions to a day task, regardless of whether it is one-off or recurring. */
export interface TaskActions {
  toggleDone: (task: DayTask) => void;
  moveToTomorrow: (task: DayTask) => void;
  /** Deletes a one-off task, or asks how to delete a recurring one. */
  remove: (task: DayTask) => void;
}

/** Returns the task action handlers wired to the stores. */
export function useTaskActions(): TaskActions {
  const toggle = useTasksStore((state) => state.toggleDone);
  const move = useTasksStore((state) => state.moveToTomorrow);
  const deleteTask = useTasksStore((state) => state.deleteTask);
  const openModal = useUiStore((state) => state.openModal);
  const toggleRow = useUiStore((state) => state.toggleRow);

  const toggleDone = useCallback(
    (task: DayTask) => toggle({ source: task.source, id: task.id, date: task.date }),
    [toggle],
  );
  const moveToTomorrow = useCallback(
    (task: DayTask) => {
      move({ source: task.source, id: task.id, date: task.date });
      toggleRow(rowKey(task));
    },
    [move, toggleRow],
  );
  const remove = useCallback(
    (task: DayTask) => {
      if (task.source === "task") {
        deleteTask(task.id);
        return;
      }
      openModal({ kind: "delete-recurring", seriesId: task.id, date: task.date });
    },
    [deleteTask, openModal],
  );
  return { toggleDone, moveToTomorrow, remove };
}

/** Stable key of a day task, used to track which row is expanded. */
export function rowKey(task: DayTask): string {
  return `${task.source}:${task.id}:${task.date}`;
}
