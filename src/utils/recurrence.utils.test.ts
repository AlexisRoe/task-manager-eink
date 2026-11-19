import type { RecurringSeries } from "@/types/task.types";
import { endSeriesBefore, occurrenceKey, occursOn } from "@/utils/recurrence.utils";

const base: RecurringSeries = {
  id: "s1",
  rule: "daily",
  anchorDate: "2026-11-16",
  endDate: null,
  title: "Stretch",
  start: null,
  durationMin: 15,
  priority: 2,
  project: "Health",
  notes: "",
};

describe("recurrence.utils", () => {
  it("never occurs before the anchor date", () => {
    expect(occursOn(base, "2026-11-15")).toBe(false);
    expect(occursOn(base, "2026-11-16")).toBe(true);
  });

  it("respects the end date inclusively", () => {
    const series = { ...base, endDate: "2026-11-18" };
    expect(occursOn(series, "2026-11-18")).toBe(true);
    expect(occursOn(series, "2026-11-19")).toBe(false);
  });

  it("matches weekdays only", () => {
    const series = { ...base, rule: "weekdays" as const };
    expect(occursOn(series, "2026-11-20")).toBe(true);
    expect(occursOn(series, "2026-11-21")).toBe(false);
    expect(occursOn(series, "2026-11-22")).toBe(false);
  });

  it("matches weekly on the anchor weekday", () => {
    const series = { ...base, rule: "weekly" as const, anchorDate: "2026-11-18" };
    expect(occursOn(series, "2026-11-25")).toBe(true);
    expect(occursOn(series, "2026-11-24")).toBe(false);
  });

  it("builds occurrence keys", () => {
    expect(occurrenceKey("s1", "2026-11-19")).toBe("s1:2026-11-19");
  });

  it("ends a series the day before, or drops it", () => {
    expect(endSeriesBefore(base, "2026-11-20")?.endDate).toBe("2026-11-19");
    expect(endSeriesBefore(base, "2026-11-16")).toBeNull();
    expect(endSeriesBefore(base, "2026-11-17")?.endDate).toBe("2026-11-16");
  });
});
