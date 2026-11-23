/** Kinds of entries the Week view can show; portrait shows one at a time. */
export type WeekPane = "tasks" | "habits";

/** Portrait toggle options of the Week view, in display order. */
export const WEEK_PANES: readonly { id: WeekPane; label: string }[] = [
  { id: "tasks", label: "Tasks" },
  { id: "habits", label: "Habits" },
];

/** Pane shown first when the Week view is opened in portrait. */
export const DEFAULT_WEEK_PANE: WeekPane = "tasks";

/** Narrows a string to a {@link WeekPane}. */
export const isWeekPane = (value: string): value is WeekPane =>
  WEEK_PANES.some((pane) => pane.id === value);
