import { DEFAULT_SCROLL_HOUR, SCROLL_LEAD_HOURS } from "@/config/app.config";
import { MINUTES_PER_HOUR } from "@/constants/date.constants";
import type { IsoDate } from "@/types/task.types";

/** Scroll target for the timeline: where to scroll and the key that triggers re-scrolling. */
export interface TimelineScroll {
  scrollToMinutes: number;
  scrollKey: string;
}

/**
 * Decides where the timeline scrolls on open: a few hours before now on today, otherwise to the
 * start of a typical day. Re-scrolls only when the shown date changes, not on every clock tick.
 */
export function timelineScroll(date: IsoDate, today: IsoDate, nowMinutes: number): TimelineScroll {
  const scrollToMinutes =
    date === today
      ? Math.max(0, nowMinutes - SCROLL_LEAD_HOURS * MINUTES_PER_HOUR)
      : DEFAULT_SCROLL_HOUR * MINUTES_PER_HOUR;
  return { scrollToMinutes, scrollKey: date };
}
