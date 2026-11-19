import { emptyPersistedTasks } from "@/store/tasks.migrations";
import { useTasksStore } from "@/store/tasks.store";
import type { RecurringSeries, Task } from "@/types/task.types";

const base = { start: null, durationMin: 30, priority: 3, project: "Work", notes: "" } as const;

/** Builds a one-off task with sensible defaults for tests. */
export function makeTask(overrides: Partial<Task> & Pick<Task, "id" | "date" | "title">): Task {
  return { ...base, done: false, carriedOver: false, ...overrides };
}

/** Builds a recurring series with sensible defaults for tests. */
export function makeSeries(
  overrides: Partial<RecurringSeries> & Pick<RecurringSeries, "id" | "anchorDate" | "title">,
): RecurringSeries {
  return { ...base, rule: "daily", endDate: null, ...overrides };
}

/** Replaces the global task store content, e.g. to arrange a scenario. */
export function seedTasks(data: {
  tasks?: Task[];
  series?: RecurringSeries[];
  carryDismissedOn?: string | null;
}): void {
  useTasksStore.setState({
    ...emptyPersistedTasks(),
    recoveredFromCorruption: false,
    tasks: data.tasks ?? [],
    series: data.series ?? [],
    carryDismissedOn: data.carryDismissedOn ?? null,
  });
}
