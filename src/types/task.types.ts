import type {
  DURATIONS,
  PRIORITIES,
  PROJECTS,
  REPEAT_OPTIONS,
  SERIES_RULES,
} from "@/constants/task.constants";

/** Local calendar date formatted as `YYYY-MM-DD`. */
export type IsoDate = string;

/** Time of day formatted as `HH:MM` (24 hours). */
export type TimeOfDay = string;

/** Planned duration of a task in minutes. */
export type Duration = (typeof DURATIONS)[number];

/** Task priority; 1 is the most important. */
export type Priority = (typeof PRIORITIES)[number];

/** Project a task belongs to. */
export type Project = (typeof PROJECTS)[number];

/** Recurrence choice offered when creating a task. */
export type RepeatOption = (typeof REPEAT_OPTIONS)[number];

/** Recurrence rule of a stored series. */
export type SeriesRule = (typeof SERIES_RULES)[number];

/** Fields shared by one-off tasks and recurring series. */
export interface TaskInput {
  title: string;
  /** Start time, or `null` for an "Anytime" task. */
  start: TimeOfDay | null;
  durationMin: Duration;
  priority: Priority;
  project: Project;
  notes: string;
}

/** A one-off task on a specific date. */
export interface Task extends TaskInput {
  id: string;
  date: IsoDate;
  done: boolean;
  carriedOver: boolean;
}

/** A recurring task template; occurrences are derived, never stored. */
export interface RecurringSeries extends TaskInput {
  id: string;
  rule: SeriesRule;
  anchorDate: IsoDate;
  /** Last date (inclusive) on which the series occurs, or `null` when open-ended. */
  endDate: IsoDate | null;
}

/** Per-date state of one occurrence of a recurring series. */
export interface OccurrenceState {
  done: boolean;
  skipped: boolean;
}

/** Task as the UI sees it on a given day, regardless of whether it is one-off or recurring. */
export interface DayTask extends TaskInput {
  /** Task id or series id. */
  id: string;
  date: IsoDate;
  done: boolean;
  carriedOver: boolean;
  source: "task" | "series";
  /** Recurrence rule when the task comes from a series. */
  rule: SeriesRule | null;
}

/** A daily habit: a titled check-off without a time, active on every date from `startDate` until `endDate`. */
export interface Habit {
  id: string;
  title: string;
  /** First date (inclusive) on which the habit is active. */
  startDate: IsoDate;
  /** Date (exclusive) from which the habit is no longer active, or `null` while it is still running. */
  endDate: IsoDate | null;
}

/** Habit as the UI sees it on a given day. */
export interface DayHabit {
  id: string;
  title: string;
  date: IsoDate;
  done: boolean;
}

/** Root of the persisted task state. */
export interface PersistedTasks {
  version: number;
  tasks: Task[];
  series: RecurringSeries[];
  occurrences: Record<string, OccurrenceState>;
  carryDismissedOn: IsoDate | null;
  habits: Habit[];
  /** Dates on which a habit was done, keyed `habitId:date`; absent keys mean not done. */
  habitChecks: Record<string, true>;
}
