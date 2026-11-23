import { heatmapLevel, historyWeekStarts } from "@/utils/history.utils";

describe("history.utils", () => {
  it("buckets completion into levels", () => {
    expect(heatmapLevel({ total: 0, done: 0 })).toBe(0);
    expect(heatmapLevel({ total: 10, done: 0 })).toBe(1);
    expect(heatmapLevel({ total: 4, done: 1 })).toBe(2);
    expect(heatmapLevel({ total: 2, done: 1 })).toBe(3);
    expect(heatmapLevel({ total: 4, done: 3 })).toBe(4);
    expect(heatmapLevel({ total: 4, done: 4 })).toBe(5);
  });

  it("lists week starts ending with the current week", () => {
    const starts = historyWeekStarts("2026-11-19", 3);
    expect(starts).toEqual(["2026-11-02", "2026-11-09", "2026-11-16"]);
  });
});
