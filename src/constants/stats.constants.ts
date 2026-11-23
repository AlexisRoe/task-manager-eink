/** Panes of the Stats view that portrait shows one at a time. */
export type StatsPane = "habits" | "tasks";

/** Portrait toggle options of the Stats view, in display order. */
export const STATS_PANES: readonly { id: StatsPane; label: string }[] = [
  { id: "habits", label: "Habits" },
  { id: "tasks", label: "Tasks" },
];

/** Pane shown first when the Stats view is opened in portrait. */
export const DEFAULT_STATS_PANE: StatsPane = "habits";

/** Narrows a string to a {@link StatsPane}. */
export const isStatsPane = (value: string): value is StatsPane =>
  STATS_PANES.some((pane) => pane.id === value);

/** Weekday labels of the weekday chart, Monday first. */
export const WEEKDAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

/** Category labels of the priority breakdown, indexed by priority minus one. */
export const PRIORITY_LABELS = ["High", "Medium", "Low"] as const;
