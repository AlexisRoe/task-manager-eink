import {
  selectCarryOverCandidates,
  selectDayStats,
  selectDayTasks,
  selectSeries,
  selectShowCarryOver,
  selectStatsByDate,
} from "@/store/tasks.selectors";
import type { TasksData } from "@/store/tasks.store";
import type { RecurringSeries, Task } from "@/types/task.types";

const base = { start: null, durationMin: 30, priority: 2, project: "Work", notes: "" } as const;

const task = (over: Partial<Task>): Task => ({
  id: "t",
  title: "T",
  date: "2026-11-19",
  done: false,
  carriedOver: false,
  ...base,
  ...over,
});

const series: RecurringSeries = {
  id: "s",
  title: "S",
  rule: "weekdays",
  anchorDate: "2026-11-16",
  endDate: null,
  ...base,
  start: "08:00",
};

const data: TasksData = {
  tasks: [
    task({ id: "a", title: "Anytime P3", priority: 3 }),
    task({ id: "b", title: "Late", start: "15:00" }),
    task({ id: "c", title: "Anytime P1", priority: 1, done: true }),
    task({ id: "y", title: "Yesterday", date: "2026-11-18" }),
  ],
  series: [series],
  occurrences: {
    "s:2026-11-19": { done: true, skipped: false },
    "s:2026-11-20": { done: false, skipped: true },
  },
  carryDismissedOn: null,
};

describe("tasks selectors", () => {
  it("orders scheduled by time, then anytime by priority", () => {
    expect(selectDayTasks(data, "2026-11-19").map((t) => t.id)).toEqual(["s", "b", "c", "a"]);
  });

  it("marks occurrence state and skips skipped ones", () => {
    expect(selectDayTasks(data, "2026-11-19")[0]).toMatchObject({ source: "series", done: true });
    expect(selectDayTasks(data, "2026-11-20")).toHaveLength(0);
    expect(selectDayTasks(data, "2026-11-21")).toHaveLength(0);
  });

  it("computes stats for days and ranges", () => {
    expect(selectDayStats(data, "2026-11-19")).toEqual({ total: 4, done: 2 });
    const range = selectStatsByDate(data, "2026-11-16", "2026-11-20");
    expect([...range.keys()]).toEqual(["2026-11-16", "2026-11-17", "2026-11-18", "2026-11-19"]);
  });

  it("finds carry-over candidates and the banner state", () => {
    expect(selectCarryOverCandidates(data, "2026-11-19").map((t) => t.id)).toEqual(["y"]);
    expect(selectShowCarryOver(data, "2026-11-19", true)).toBe(true);
    expect(selectShowCarryOver(data, "2026-11-19", false)).toBe(false);
    expect(
      selectShowCarryOver({ ...data, carryDismissedOn: "2026-11-19" }, "2026-11-19", true),
    ).toBe(false);
    expect(selectShowCarryOver(data, "2026-11-25", true)).toBe(false);
  });

  it("looks up series", () => {
    expect(selectSeries(data, "s")).toBe(series);
    expect(selectSeries(data, "x")).toBeUndefined();
  });
});
