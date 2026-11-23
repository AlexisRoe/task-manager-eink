/** Number of weeks shown in the history heatmap, ending with the current week. */
export const HISTORY_WEEKS = 18;

/** Minimum completion ratio of a day to count towards the streak. */
export const STREAK_MIN_RATIO = 0.75;

/** Number of past days (excluding today) summed for the "done recently" statistic. */
export const RECENT_DAYS = 30;

/** Lower completion bounds (ratio) of heatmap levels 2 to 5; level 1 is anything below the first. */
export const HEATMAP_THRESHOLDS = [0.25, 0.5, 0.75, 1] as const;

/** Heatmap intensity levels: 0 means the day has no tasks, 5 means fully done. */
export type HeatmapLevel = 0 | 1 | 2 | 3 | 4 | 5;

/** Number of non-empty heatmap levels. */
export const HEATMAP_LEVELS: readonly HeatmapLevel[] = [0, 1, 2, 3, 4, 5];

/** Panes of the History view that portrait shows one at a time. */
export type HistoryPane = "overview" | "day";

/** Portrait toggle options of the History view, in display order. */
export const HISTORY_PANES: readonly { id: HistoryPane; label: string }[] = [
  { id: "overview", label: "Statistics" },
  { id: "day", label: "Day" },
];

/** Pane shown first when the History view is opened in portrait. */
export const DEFAULT_HISTORY_PANE: HistoryPane = "overview";

/** Narrows a string to a {@link HistoryPane}. */
export const isHistoryPane = (value: string): value is HistoryPane =>
  HISTORY_PANES.some((pane) => pane.id === value);

/** Row labels of the heatmap: Monday to Sunday with only every other weekday named. */
export const HEATMAP_ROW_LABELS = ["Mon", "", "Wed", "", "Fri", "", "Sun"] as const;
