import "e-ink-ui-lib/style.css";

export * from "e-ink-ui-lib";
export type {
  HeatmapCell,
  HeatmapLevel,
  HeatmapProps,
} from "./candidates/heatmap/heatmap.component";
export { Heatmap } from "./candidates/heatmap/heatmap.component";
export type { InvertedProps } from "./candidates/inverted/inverted.component";
export { Inverted } from "./candidates/inverted/inverted.component";
export type {
  SegmentedItemProps,
  SegmentedProps,
} from "./candidates/segmented/segmented.component";
export { Segmented } from "./candidates/segmented/segmented.component";
export type { TimeGridItem, TimeGridProps } from "./candidates/time-grid/time-grid.component";
export { TimeGrid } from "./candidates/time-grid/time-grid.component";
