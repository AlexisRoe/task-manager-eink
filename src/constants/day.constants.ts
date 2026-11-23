/** Panes of the Day view that portrait shows one at a time. */
export type DayPane = "timeline" | "list";

/** Portrait toggle options of the Day view, in display order. */
export const DAY_PANES: readonly { id: DayPane; label: string }[] = [
  { id: "list", label: "List" },
  { id: "timeline", label: "Timeline" },
];

/** Pane shown first when the Day view is opened in portrait. */
export const DEFAULT_DAY_PANE: DayPane = "list";

/** Narrows a string to a {@link DayPane}. */
export const isDayPane = (value: string): value is DayPane =>
  DAY_PANES.some((pane) => pane.id === value);
