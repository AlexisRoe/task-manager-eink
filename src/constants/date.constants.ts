/** Number of days in a calendar week. */
export const DAYS_PER_WEEK = 7;

/** Number of minutes in one hour. */
export const MINUTES_PER_HOUR = 60;

/** Number of minutes in one day. */
export const MINUTES_PER_DAY = 24 * MINUTES_PER_HOUR;

/** Locale used for all human-readable date formatting. */
export const DATE_LOCALE = "en-GB";

/** Pattern for a local calendar date, `YYYY-MM-DD`. */
export const ISO_DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

/** Pattern for a time of day entered by the user, `H:MM` or `HH:MM`. */
export const TIME_INPUT_PATTERN = /^(\d{1,2}):(\d{2})$/;
