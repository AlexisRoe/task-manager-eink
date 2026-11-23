/** Top-level views of the app. */
export type ViewName = "day" | "week" | "history";

/** Modal currently shown over the app. */
export type ModalState =
  | { kind: "none" }
  | { kind: "new-task" }
  | { kind: "edit-task"; source: "task" | "series"; id: string }
  | { kind: "delete-recurring"; seriesId: string; date: string };
