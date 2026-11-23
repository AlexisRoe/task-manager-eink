import { makeHabit } from "@/test/fixtures.utils";
import { habitCheckKey } from "@/utils/habit.utils";
import { groupRates, habitStreak, percent, weekdayRates, weeklyTotals } from "./stats.utils";

const TODAY = "2026-03-18";
const WINDOW = 30;

function checksFor(id: string, dates: string[]): Record<string, true> {
  return Object.fromEntries(dates.map((date) => [habitCheckKey(id, date), true as const]));
}

describe("percent", () => {
  it("rounds and handles empty days", () => {
    expect(percent({ total: 3, done: 1 })).toBe(33);
    expect(percent({ total: 0, done: 0 })).toBe(0);
  });
});

describe("habitStreak", () => {
  const habit = makeHabit({ id: "h", title: "Read", startDate: "2026-03-01" });

  it("does not break the current streak while today is unchecked", () => {
    const checks = checksFor("h", ["2026-03-15", "2026-03-16", "2026-03-17"]);
    const result = habitStreak(habit, checks, TODAY, WINDOW);
    expect(result.current).toBe(3);
    expect(result.longest).toBe(3);
  });

  it("counts today and keeps the longest earlier run", () => {
    const checks = checksFor("h", [
      "2026-03-02",
      "2026-03-03",
      "2026-03-04",
      "2026-03-05",
      "2026-03-17",
      "2026-03-18",
    ]);
    const result = habitStreak(habit, checks, TODAY, WINDOW);
    expect(result.current).toBe(2);
    expect(result.longest).toBe(4);
  });

  it("flags always and never only after enough active days", () => {
    const days = Array.from({ length: 18 }, (_, i) => `2026-03-${String(i + 1).padStart(2, "0")}`);
    expect(habitStreak(habit, checksFor("h", days), TODAY, WINDOW).flag).toBe("always");
    expect(habitStreak(habit, {}, TODAY, WINDOW).flag).toBe("never");
    const young = makeHabit({ id: "y", title: "New", startDate: "2026-03-16" });
    expect(habitStreak(young, {}, TODAY, WINDOW).flag).toBeNull();
  });

  it("stops at the end date of an ended habit", () => {
    const ended = makeHabit({
      id: "e",
      title: "Old",
      startDate: "2026-03-01",
      endDate: "2026-03-04",
    });
    const result = habitStreak(
      ended,
      checksFor("e", ["2026-03-01", "2026-03-02", "2026-03-03"]),
      TODAY,
      WINDOW,
    );
    expect(result.longest).toBe(3);
    expect(result.rate).toBe(100);
  });
});

describe("aggregations", () => {
  const stats = new Map([
    ["2026-03-16", { total: 2, done: 2 }],
    ["2026-03-17", { total: 2, done: 1 }],
    ["2026-03-23", { total: 4, done: 0 }],
  ]);

  it("sums weeks and tolerates empty weeks", () => {
    expect(weeklyTotals(stats, ["2026-03-09", "2026-03-16"])).toEqual([
      { total: 0, done: 0 },
      { total: 4, done: 3 },
    ]);
  });

  it("rates weekdays Monday first", () => {
    expect(weekdayRates(stats)).toEqual([33, 50, 0, 0, 0, 0, 0]);
  });

  it("groups item completion", () => {
    const items = [
      { done: true, g: 0 },
      { done: false, g: 0 },
      { done: true, g: 1 },
    ];
    expect(groupRates(items, 3, (item) => item.g)).toEqual([50, 100, 0]);
  });
});
