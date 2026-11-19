import { PriorityBadge } from "@/components/priority-badge.component";
import { REPEAT_LABELS } from "@/constants/task.constants";
import type { DayTask } from "@/types/task.types";
import { Button, Checkbox, Text } from "@/ui";
import { formatTimeRange } from "@/utils/time.utils";

/** Props of {@link TaskRow}. */
export interface TaskRowProps {
  task: DayTask;
  /** Whether the row shows notes and actions. */
  expanded: boolean;
  onToggleExpanded: () => void;
  onToggleDone: () => void;
  onMoveToTomorrow: () => void;
  onDelete: () => void;
}

/** Builds the secondary line: project, recurrence, carry-over and note hints. */
function metaParts(task: DayTask, expanded: boolean): string[] {
  const parts: string[] = [task.project];
  if (task.rule !== null) parts.push(`↻ ${REPEAT_LABELS[task.rule]}`);
  if (task.carriedOver) parts.push("Carried over");
  if (task.notes !== "" && !expanded) parts.push("Has note");
  return parts;
}

/** One task of the day list with checkbox, meta line, priority badge, time and expandable actions. */
export function TaskRow({
  task,
  expanded,
  onToggleExpanded,
  onToggleDone,
  onMoveToTomorrow,
  onDelete,
}: TaskRowProps) {
  return (
    <li className="task-row" data-expanded={expanded} data-done={task.done}>
      <div className="task-row__main">
        <Checkbox
          checked={task.done}
          onChange={onToggleDone}
          aria-label={`Mark "${task.title}" as done`}
          className="task-row__check"
        >
          {""}
        </Checkbox>
        <button
          type="button"
          className="task-row__body"
          aria-expanded={expanded}
          onClick={onToggleExpanded}
        >
          <span className="task-row__title">{task.title}</span>
          <span className="task-row__meta">{metaParts(task, expanded).join(" · ")}</span>
        </button>
        <PriorityBadge priority={task.priority} done={task.done} />
        <span className="task-row__time">
          {task.start === null ? "" : formatTimeRange(task.start, task.durationMin)}
        </span>
      </div>
      {expanded ? (
        <div className="task-row__details">
          {task.notes === "" ? null : <Text>{task.notes}</Text>}
          <div className="task-row__actions">
            <Button.Outlined onClick={onMoveToTomorrow}>Move to tomorrow</Button.Outlined>
            <Button.Outlined onClick={onDelete}>Delete</Button.Outlined>
          </div>
        </div>
      ) : null}
    </li>
  );
}
