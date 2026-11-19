/** First hour (inclusive) shown on the day timeline. */
export const DAY_START_HOUR = 0;

/** Last hour (exclusive) shown on the day timeline. */
export const DAY_END_HOUR = 24;

/** Height of one timeline hour in pixels. */
export const HOUR_HEIGHT_PX = 88;

/** Minimum height of a timeline block in pixels so short tasks stay tappable. */
export const MIN_BLOCK_HEIGHT_PX = 28;

/** Whether completed tasks are hidden from lists. */
export const HIDE_DONE = false;

/** Whether the carry-over banner for yesterday's unfinished tasks is offered. */
export const CARRY_PROMPT_ENABLED = true;

/** Interval in milliseconds at which the "now" clock refreshes. */
export const NOW_TICK_MS = 60_000;

/** Hours before the current time the timeline scrolls to on today. */
export const SCROLL_LEAD_HOURS = 4;

/** Hour the timeline scrolls to on days other than today. */
export const DEFAULT_SCROLL_HOUR = 8;

/** How long toast notifications stay visible, in milliseconds. */
export const NOTIFICATION_DURATION_MS = 4000;
