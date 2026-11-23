import { TaskRow } from "@/components/task-row.component";
import type { TaskActions } from "@/hooks/task-actions.hook";
import { rowKey } from "@/hooks/task-actions.hook";
import type { DayTask } from "@/types/task.types";
import { Title } from "@/ui";

/** Props of {@link TaskList}. */
export interface TaskListProps {
  title: string;
  tasks: readonly DayTask[];
  openRow: string | null;
  onToggleRow: (key: string) => void;
  actions: TaskActions;
}

/** Titled section of task rows with a count, used for "Scheduled" and "Anytime". */
export function TaskList({ title, tasks, openRow, onToggleRow, actions }: TaskListProps) {
  return (
    <section className="task-list" aria-label={title}>
      <div className="task-list__header">
        <Title size="3">{title}</Title>
        <Title size="3">{tasks.length}</Title>
      </div>
      <ul className="task-list__items">
        {tasks.map((task) => {
          const key = rowKey(task);
          return (
            <TaskRow
              key={key}
              task={task}
              expanded={openRow === key}
              onToggleExpanded={() => onToggleRow(key)}
              onToggleDone={() => actions.toggleDone(task)}
              onEdit={() => actions.edit(task)}
              onMoveToTomorrow={() => actions.moveToTomorrow(task)}
              onDelete={() => actions.remove(task)}
            />
          );
        })}
      </ul>
    </section>
  );
}
