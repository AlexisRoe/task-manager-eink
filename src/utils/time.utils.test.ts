import {
  formatDuration,
  formatTimeRange,
  fromMinutes,
  minutesOfDay,
  normalizeTime,
  toMinutes,
} from "@/utils/time.utils";

describe("time.utils", () => {
  it("normalizes valid times", () => {
    expect(normalizeTime("9:05")).toBe("09:05");
    expect(normalizeTime(" 14:30 ")).toBe("14:30");
    expect(normalizeTime("00:00")).toBe("00:00");
    expect(normalizeTime("23:59")).toBe("23:59");
  });

  it("rejects invalid times", () => {
    for (const bad of ["24:00", "12:60", "9", "9:5", "abc", "", "12:345"]) {
      expect(normalizeTime(bad)).toBeNull();
    }
  });

  it("converts between minutes and time strings", () => {
    expect(toMinutes("09:30")).toBe(570);
    expect(fromMinutes(570)).toBe("09:30");
    expect(fromMinutes(-5)).toBe("00:00");
    expect(fromMinutes(5000)).toBe("23:59");
    expect(minutesOfDay(new Date(2026, 0, 1, 7, 8))).toBe(428);
  });

  it("formats ranges and durations", () => {
    expect(formatTimeRange("09:00", 30)).toBe("09:00–09:30");
    expect(formatTimeRange("23:50", 90)).toBe("23:50–23:59");
    expect(formatDuration(15)).toBe("15 min");
    expect(formatDuration(60)).toBe("1 h");
    expect(formatDuration(90)).toBe("1 h 30 min");
  });
});
