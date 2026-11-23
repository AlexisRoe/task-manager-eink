import {
  DURATIONS,
  NOTES_MAX_LENGTH,
  PRIORITIES,
  PROJECTS,
  REPEAT_OPTIONS,
  SERIES_RULES,
  TITLE_MAX_LENGTH,
} from "@/constants/task.constants";
import type {
  Habit,
  OccurrenceState,
  PersistedTasks,
  RecurringSeries,
  RepeatOption,
  Task,
  TaskInput,
} from "@/types/task.types";
import { isIsoDate } from "@/utils/date.utils";
import { normalizeTime } from "@/utils/time.utils";

/** Raw values of the new-task form before validation. */
export interface TaskDraft {
  title: string;
  start: string;
  durationMin: number;
  priority: number;
  project: string;
  notes: string;
  repeat: string;
}

/** Validation errors keyed by form field. */
export type TaskDraftErrors = Partial<Record<"title" | "start" | "notes", string>>;

/** Result of validating a draft: either a clean value or per-field errors. */
export type TaskDraftResult =
  | { ok: true; value: TaskInput; repeat: RepeatOption }
  | { ok: false; errors: TaskDraftErrors };

const isOneOf = <T extends readonly (string | number)[]>(
  list: T,
  value: unknown,
): value is T[number] => list.includes(value as T[number]);

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

/** Validates and normalizes the new-task form so only safe, bounded data reaches the store. */
export function validateTaskDraft(draft: TaskDraft): TaskDraftResult {
  const errors: TaskDraftErrors = {};
  const title = draft.title.trim();
  const notes = draft.notes.trim();

  if (title.length === 0) errors.title = "Title is required";
  else if (title.length > TITLE_MAX_LENGTH)
    errors.title = `Title must be at most ${TITLE_MAX_LENGTH} characters`;

  if (notes.length > NOTES_MAX_LENGTH)
    errors.notes = `Notes must be at most ${NOTES_MAX_LENGTH} characters`;

  let start: string | null = null;
  if (draft.start.trim() !== "") {
    start = normalizeTime(draft.start);
    if (start === null) errors.start = "Use a time like 9:30 or 14:00";
  }

  if (
    !isOneOf(DURATIONS, draft.durationMin) ||
    !isOneOf(PRIORITIES, draft.priority) ||
    !isOneOf(PROJECTS, draft.project) ||
    !isOneOf(REPEAT_OPTIONS, draft.repeat)
  ) {
    return { ok: false, errors };
  }
  if (Object.keys(errors).length > 0) return { ok: false, errors };

  return {
    ok: true,
    repeat: draft.repeat,
    value: {
      title,
      start,
      durationMin: draft.durationMin,
      priority: draft.priority,
      project: draft.project,
      notes,
    },
  };
}

function isTaskInput(value: Record<string, unknown>): boolean {
  const { title, start, notes } = value;
  return (
    typeof title === "string" &&
    title.length > 0 &&
    title.length <= TITLE_MAX_LENGTH &&
    (start === null || (typeof start === "string" && normalizeTime(start) === start)) &&
    typeof notes === "string" &&
    notes.length <= NOTES_MAX_LENGTH &&
    isOneOf(DURATIONS, value.durationMin) &&
    isOneOf(PRIORITIES, value.priority) &&
    isOneOf(PROJECTS, value.project)
  );
}

/** Type guard for a persisted one-off task. */
export function isTask(value: unknown): value is Task {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    isIsoDate(value.date) &&
    typeof value.done === "boolean" &&
    typeof value.carriedOver === "boolean" &&
    isTaskInput(value)
  );
}

/** Type guard for a persisted recurring series. */
export function isSeries(value: unknown): value is RecurringSeries {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    isOneOf(SERIES_RULES, value.rule) &&
    isIsoDate(value.anchorDate) &&
    (value.endDate === null || isIsoDate(value.endDate)) &&
    isTaskInput(value)
  );
}

/** Type guard for the state of one occurrence. */
export function isOccurrenceState(value: unknown): value is OccurrenceState {
  return isRecord(value) && typeof value.done === "boolean" && typeof value.skipped === "boolean";
}

/** Result of validating a habit title: either the clean title or an error message. */
export type HabitTitleResult = { ok: true; value: string } | { ok: false; error: string };

/** Validates and normalizes a habit title so only safe, bounded data reaches the store. */
export function validateHabitTitle(raw: string): HabitTitleResult {
  const title = raw.trim();
  if (title.length === 0) return { ok: false, error: "Title is required" };
  if (title.length > TITLE_MAX_LENGTH)
    return { ok: false, error: `Title must be at most ${TITLE_MAX_LENGTH} characters` };
  return { ok: true, value: title };
}

/** Type guard for a persisted habit. */
export function isHabit(value: unknown): value is Habit {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    typeof value.title === "string" &&
    value.title.length > 0 &&
    value.title.length <= TITLE_MAX_LENGTH &&
    isIsoDate(value.startDate) &&
    (value.endDate === null ||
      (isIsoDate(value.endDate) && value.endDate > (value.startDate as string)))
  );
}

/** Type guard for the whole persisted root; rejects anything that does not match the schema. */
export function isPersistedTasks(value: unknown): value is PersistedTasks {
  if (!isRecord(value)) return false;
  const { version, tasks, series, occurrences, carryDismissedOn, habits, habitChecks } = value;
  return (
    Array.isArray(habits) &&
    habits.every(isHabit) &&
    isRecord(habitChecks) &&
    Object.values(habitChecks).every((check) => check === true) &&
    typeof version === "number" &&
    Array.isArray(tasks) &&
    tasks.every(isTask) &&
    Array.isArray(series) &&
    series.every(isSeries) &&
    isRecord(occurrences) &&
    Object.values(occurrences).every(isOccurrenceState) &&
    (carryDismissedOn === null || isIsoDate(carryDismissedOn))
  );
}
