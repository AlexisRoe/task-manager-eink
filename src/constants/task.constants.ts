/** Selectable task durations in minutes. */
export const DURATIONS = [15, 30, 60, 90] as const;

/** Selectable priorities; 1 is the most important. */
export const PRIORITIES = [1, 2, 3] as const;

/** Selectable projects a task can belong to. */
export const PROJECTS = ["Work", "Personal", "Health", "Home"] as const;

/** Recurrence rules a task can be created with; `none` creates a one-off task. */
export const REPEAT_OPTIONS = ["none", "daily", "weekdays", "weekly"] as const;

/** Recurrence rules a stored series can have. */
export const SERIES_RULES = ["daily", "weekdays", "weekly"] as const;

/** Human-readable labels for recurrence rules. */
export const REPEAT_LABELS: Record<(typeof REPEAT_OPTIONS)[number], string> = {
  none: "None",
  daily: "Daily",
  weekdays: "Weekdays",
  weekly: "Weekly",
};

/** Maximum number of characters in a task title. */
export const TITLE_MAX_LENGTH = 120;

/** Maximum number of characters in task notes. */
export const NOTES_MAX_LENGTH = 1000;

/** Default form values for a new task. */
export const TASK_DEFAULTS = {
  durationMin: 30,
  priority: 2,
  project: "Work",
  repeat: "none",
} as const;

/** Priority value that is rendered as a filled badge and inverted on the timeline. */
export const HIGH_PRIORITY = 1;

/** Priority value that is rendered as an outlined badge. */
export const MEDIUM_PRIORITY = 2;

/** Button labels for the selectable durations. */
export const DURATION_LABELS: Record<(typeof DURATIONS)[number], string> = {
  15: "15 min",
  30: "30 min",
  60: "1 h",
  90: "1.5 h",
};
