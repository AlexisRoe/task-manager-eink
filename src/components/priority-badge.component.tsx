import { HIGH_PRIORITY, MEDIUM_PRIORITY } from "@/constants/task.constants";
import type { Priority } from "@/types/task.types";
import { Pill } from "@/ui";

/** Props of {@link PriorityBadge}. */
export interface PriorityBadgeProps {
  priority: Priority;
  /** Completed tasks show no badge. */
  done: boolean;
}

/** Compact P1 (filled) / P2 (outlined) marker; P3 and completed tasks show nothing. */
export function PriorityBadge({ priority, done }: PriorityBadgeProps) {
  if (done) return null;
  if (priority === HIGH_PRIORITY) return <Pill.Filled size="sm">P{priority}</Pill.Filled>;
  if (priority === MEDIUM_PRIORITY) return <Pill size="sm">P{priority}</Pill>;
  return null;
}
