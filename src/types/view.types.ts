/** Top-level views of the app. */
export type ViewName = "day" | "week" | "history" | "stats";

/** Modal currently shown over the app. */
export type ModalState =
  | { kind: "none" }
  | { kind: "new-task" }
  | { kind: "edit-task"; source: "task" | "series"; id: string }
  | { kind: "delete-recurring"; seriesId: string; date: string }
  | { kind: "new-habit" }
  | { kind: "edit-habit"; id: string }
  | { kind: "delete-habit"; id: string };
