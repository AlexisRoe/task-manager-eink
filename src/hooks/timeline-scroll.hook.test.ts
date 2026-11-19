import { timelineScroll } from "@/hooks/timeline-scroll.hook";

describe("timelineScroll", () => {
  it("scrolls to now minus four hours on today", () => {
    expect(timelineScroll("2026-11-19", "2026-11-19", 640)).toEqual({
      scrollToMinutes: 400,
      scrollKey: "2026-11-19",
    });
  });

  it("never scrolls above midnight", () => {
    expect(timelineScroll("2026-11-19", "2026-11-19", 60).scrollToMinutes).toBe(0);
  });

  it("scrolls to 08:00 on other days", () => {
    expect(timelineScroll("2026-11-20", "2026-11-19", 640).scrollToMinutes).toBe(480);
  });
});
