import { AboutModal } from "@/components/about-modal.component";
import { DeleteHabitModal } from "@/components/delete-habit-modal.component";
import { DeleteRecurringModal } from "@/components/delete-recurring-modal.component";
import { HabitModal } from "@/components/habit-modal.component";
import { NewTaskModal } from "@/components/new-task-modal.component";
import { useTasksStore } from "@/store/tasks.store";
import { useUiStore } from "@/store/ui.store";
import { todayIso } from "@/utils/date.utils";

/** Renders whichever modal the UI store currently asks for. */
export function ModalHost() {
  const modal = useUiStore((state) => state.modal);
  const view = useUiStore((state) => state.view);
  const date = useUiStore((state) => state.date);
  const close = useUiStore((state) => state.closeModal);
  const tasks = useTasksStore((state) => state.tasks);
  const series = useTasksStore((state) => state.series);
  const habits = useTasksStore((state) => state.habits);

  switch (modal.kind) {
    case "about":
      return <AboutModal onClose={close} />;
    case "new-task":
      return <NewTaskModal date={view === "history" ? todayIso() : date} onClose={close} />;
    case "edit-task": {
      const target = (modal.source === "task" ? tasks : series).find((t) => t.id === modal.id);
      if (target === undefined) return null;
      return (
        <NewTaskModal
          date={date}
          onClose={close}
          editing={{ source: modal.source, id: modal.id, task: target }}
        />
      );
    }
    case "delete-recurring":
      return <DeleteRecurringModal seriesId={modal.seriesId} date={modal.date} onClose={close} />;
    case "new-habit":
      return <HabitModal today={todayIso()} onClose={close} />;
    case "edit-habit": {
      const habit = habits.find((h) => h.id === modal.id);
      if (habit === undefined) return null;
      return <HabitModal today={todayIso()} onClose={close} editing={habit} />;
    }
    case "delete-habit": {
      const habit = habits.find((h) => h.id === modal.id);
      if (habit === undefined) return null;
      return <DeleteHabitModal habit={habit} today={todayIso()} onClose={close} />;
    }
    case "none":
      return null;
  }
}
