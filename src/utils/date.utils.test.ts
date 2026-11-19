import {
  addDays,
  compareIso,
  dayOfMonth,
  diffDays,
  formatDayHeading,
  formatFullDate,
  formatMonthShort,
  formatNavDate,
  formatWeekdayLong,
  formatWeekdayShort,
  isIsoDate,
  isoWeekNumber,
  parseIsoDate,
  startOfWeek,
  todayIso,
  toIsoDate,
  weekDates,
  weekdayIndex,
} from "@/utils/date.utils";

describe("date.utils", () => {
  it("round-trips ISO dates", () => {
    expect(toIsoDate(new Date(2026, 10, 9))).toBe("2026-11-09");
    expect(parseIsoDate("2026-11-09")?.getDate()).toBe(9);
    expect(todayIso(new Date(2026, 0, 5, 23, 59))).toBe("2026-01-05");
  });

  it("rejects invalid dates", () => {
    for (const bad of ["2026-02-30", "2026-13-01", "26-01-01", "", "2026-1-1"]) {
      expect(parseIsoDate(bad)).toBeNull();
      expect(isIsoDate(bad)).toBe(false);
    }
    expect(isIsoDate(42)).toBe(false);
    expect(isIsoDate("2024-02-29")).toBe(true);
  });

  it("adds days across month, year and leap boundaries", () => {
    expect(addDays("2026-01-31", 1)).toBe("2026-02-01");
    expect(addDays("2026-12-31", 1)).toBe("2027-01-01");
    expect(addDays("2024-02-28", 1)).toBe("2024-02-29");
    expect(addDays("2026-03-01", -1)).toBe("2026-02-28");
  });

  it("adds days across DST changes without drifting", () => {
    expect(addDays("2026-03-28", 2)).toBe("2026-03-30");
    expect(addDays("2026-10-24", 2)).toBe("2026-10-26");
    expect(addDays("2026-03-08", 1)).toBe("2026-03-09");
    expect(addDays("2026-11-01", 1)).toBe("2026-11-02");
  });

  it("computes weekdays with Monday first", () => {
    expect(weekdayIndex("2026-11-16")).toBe(0);
    expect(weekdayIndex("2026-11-22")).toBe(6);
    expect(startOfWeek("2026-11-22")).toBe("2026-11-16");
    expect(startOfWeek("2026-11-16")).toBe("2026-11-16");
    expect(weekDates("2026-11-19")).toEqual([
      "2026-11-16",
      "2026-11-17",
      "2026-11-18",
      "2026-11-19",
      "2026-11-20",
      "2026-11-21",
      "2026-11-22",
    ]);
  });

  it("compares and diffs dates", () => {
    expect(compareIso("2026-01-01", "2026-01-02")).toBe(-1);
    expect(compareIso("2026-01-02", "2026-01-01")).toBe(1);
    expect(compareIso("2026-01-01", "2026-01-01")).toBe(0);
    expect(diffDays("2026-03-28", "2026-03-30")).toBe(2);
    expect(diffDays("2026-03-30", "2026-03-28")).toBe(-2);
  });

  it("computes ISO week numbers including week 1 and 53", () => {
    expect(isoWeekNumber("2026-01-01")).toBe(1);
    expect(isoWeekNumber("2025-12-29")).toBe(1);
    expect(isoWeekNumber("2020-12-31")).toBe(53);
    expect(isoWeekNumber("2021-01-03")).toBe(53);
    expect(isoWeekNumber("2021-01-04")).toBe(1);
    expect(isoWeekNumber("2026-11-19")).toBe(47);
  });

  it("formats labels", () => {
    expect(formatDayHeading("2026-11-19")).toBe("Thursday 19 November");
    expect(formatWeekdayShort("2026-11-19")).toBe("Thu");
    expect(formatMonthShort("2026-11-19")).toBe("Nov");
    expect(dayOfMonth("2026-11-19")).toBe(19);
  });

  it("throws on invalid input where a date is required", () => {
    expect(() => addDays("nope", 1)).toThrow(RangeError);
  });
});

describe("date.utils display helpers", () => {
  it("formats navigation and full dates", () => {
    expect(formatNavDate("2026-11-19")).toBe("Thu, 19 Nov");
    expect(formatFullDate("2026-11-19")).toBe("19 November 2026");
    expect(formatWeekdayLong("2026-11-19")).toBe("Thursday");
  });
});
