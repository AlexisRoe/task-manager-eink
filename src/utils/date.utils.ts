import { DATE_LOCALE, DAYS_PER_WEEK, ISO_DATE_PATTERN } from "@/constants/date.constants";
import type { IsoDate } from "@/types/task.types";

const pad = (value: number, length = 2): string => String(value).padStart(length, "0");

/** Formats a `Date` as a local `YYYY-MM-DD` string. */
export function toIsoDate(date: Date): IsoDate {
  return `${pad(date.getFullYear(), 4)}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** Parses a `YYYY-MM-DD` string into a local `Date`, or `null` if it is not a real calendar date. */
export function parseIsoDate(value: string): Date | null {
  const match = ISO_DATE_PATTERN.exec(value);
  if (!match) return null;
  const [year, month, day] = [Number(match[1]), Number(match[2]), Number(match[3])];
  const date = new Date(year, month - 1, day);
  const valid =
    date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
  return valid ? date : null;
}

/** Tells whether a value is a valid `YYYY-MM-DD` calendar date. */
export function isIsoDate(value: unknown): value is IsoDate {
  return typeof value === "string" && parseIsoDate(value) !== null;
}

/** Returns today's local date. */
export function todayIso(now: Date = new Date()): IsoDate {
  return toIsoDate(now);
}

function requireDate(value: IsoDate): Date {
  const date = parseIsoDate(value);
  if (!date) throw new RangeError(`Invalid ISO date: ${value}`);
  return date;
}

/** Adds (or subtracts) whole calendar days, independent of daylight-saving changes. */
export function addDays(value: IsoDate, days: number): IsoDate {
  const date = requireDate(value);
  date.setDate(date.getDate() + days);
  return toIsoDate(date);
}

/** Returns the weekday index with Monday = 0 and Sunday = 6. */
export function weekdayIndex(value: IsoDate): number {
  return (requireDate(value).getDay() + 6) % DAYS_PER_WEEK;
}

/** Returns the Monday of the week containing the date. */
export function startOfWeek(value: IsoDate): IsoDate {
  return addDays(value, -weekdayIndex(value));
}

/** Returns the seven dates (Monday to Sunday) of the week containing the date. */
export function weekDates(value: IsoDate): IsoDate[] {
  const monday = startOfWeek(value);
  return Array.from({ length: DAYS_PER_WEEK }, (_, offset) => addDays(monday, offset));
}

/** Compares two ISO dates; negative when `a` is earlier than `b`. */
export function compareIso(a: IsoDate, b: IsoDate): number {
  return a < b ? -1 : a > b ? 1 : 0;
}

/** Number of whole days from `from` to `to` (positive when `to` is later). */
export function diffDays(from: IsoDate, to: IsoDate): number {
  const a = requireDate(from);
  const b = requireDate(to);
  const utcA = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
  const utcB = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());
  return Math.round((utcB - utcA) / 86_400_000);
}

/** Returns the ISO-8601 week number (1–53) of the date. */
export function isoWeekNumber(value: IsoDate): number {
  const date = requireDate(value);
  const thursday = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  thursday.setDate(thursday.getDate() + 3 - weekdayIndex(value));
  const firstThursday = new Date(thursday.getFullYear(), 0, 4);
  firstThursday.setDate(firstThursday.getDate() + 3 - ((firstThursday.getDay() + 6) % 7));
  return 1 + Math.round(diffDays(toIsoDate(firstThursday), toIsoDate(thursday)) / DAYS_PER_WEEK);
}

/** Formats a date for display using the app locale and the given `Intl` options. */
export function formatDate(value: IsoDate, options: Intl.DateTimeFormatOptions): string {
  return new Intl.DateTimeFormat(DATE_LOCALE, options).format(requireDate(value));
}

/** Long heading form, e.g. "Thursday, 19 November". */
export function formatDayHeading(value: IsoDate): string {
  return formatDate(value, { weekday: "long", day: "numeric", month: "long" });
}

/** Full weekday name, e.g. "Thursday". */
export function formatWeekdayLong(value: IsoDate): string {
  return formatDate(value, { weekday: "long" });
}

/** Full date, e.g. "19 November 2026". */
export function formatFullDate(value: IsoDate): string {
  return formatDate(value, { day: "numeric", month: "long", year: "numeric" });
}

/** Compact navigation label, e.g. "Thu, 19 Nov". */
export function formatNavDate(value: IsoDate): string {
  return `${formatWeekdayShort(value)}, ${dayOfMonth(value)} ${formatMonthShort(value)}`;
}

/** Short weekday name, e.g. "Thu". */
export function formatWeekdayShort(value: IsoDate): string {
  return formatDate(value, { weekday: "short" });
}

/** Short month name, e.g. "Nov". */
export function formatMonthShort(value: IsoDate): string {
  return formatDate(value, { month: "short" });
}

/** Day of the month as a number. */
export function dayOfMonth(value: IsoDate): number {
  return requireDate(value).getDate();
}
