import {
  averageCompletion,
  computeStreak,
  doneInRecentDays,
  heatmapLevel,
  historyWeekStarts,
  type StatsByDate,
} from "@/utils/history.utils";

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

  it("computes the streak before today", () => {
    const stats: StatsByDate = new Map([
      ["2026-11-18", { total: 4, done: 4 }],
      ["2026-11-17", { total: 4, done: 3 }],
      ["2026-11-16", { total: 4, done: 2 }],
      ["2026-11-19", { total: 4, done: 0 }],
    ]);
    expect(computeStreak(stats, "2026-11-19")).toBe(2);
    expect(computeStreak(new Map(), "2026-11-19")).toBe(0);
  });

  it("sums done tasks of the last 30 days excluding today", () => {
    const stats: StatsByDate = new Map([
      ["2026-11-19", { total: 5, done: 5 }],
      ["2026-11-18", { total: 3, done: 2 }],
      ["2026-10-20", { total: 3, done: 3 }],
      ["2026-10-19", { total: 3, done: 3 }],
    ]);
    expect(doneInRecentDays(stats, "2026-11-19")).toBe(5);
  });

  it("averages completion over past days with tasks", () => {
    const stats: StatsByDate = new Map([
      ["2026-11-16", { total: 2, done: 2 }],
      ["2026-11-17", { total: 4, done: 2 }],
      ["2026-11-20", { total: 4, done: 4 }],
    ]);
    expect(averageCompletion(stats, ["2026-11-16"], "2026-11-19")).toBeCloseTo(0.75);
    expect(averageCompletion(new Map(), ["2026-11-16"], "2026-11-19")).toBe(0);
  });
});
