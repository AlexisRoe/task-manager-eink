import { MINUTES_PER_DAY, MINUTES_PER_HOUR, TIME_INPUT_PATTERN } from "@/constants/date.constants";
import type { TimeOfDay } from "@/types/task.types";

const pad = (value: number): string => String(value).padStart(2, "0");

/** Normalizes user input `H:MM`/`HH:MM` to `HH:MM`, or returns `null` if it is not a valid time. */
export function normalizeTime(input: string): TimeOfDay | null {
  const match = TIME_INPUT_PATTERN.exec(input.trim());
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours > 23 || minutes > 59) return null;
  return `${pad(hours)}:${pad(minutes)}`;
}

/** Converts `HH:MM` to minutes since midnight. */
export function toMinutes(time: TimeOfDay): number {
  const [hours = 0, minutes = 0] = time.split(":").map(Number);
  return hours * MINUTES_PER_HOUR + minutes;
}

/** Converts minutes since midnight to `HH:MM`, clamped to the same day. */
export function fromMinutes(total: number): TimeOfDay {
  const clamped = Math.min(Math.max(Math.trunc(total), 0), MINUTES_PER_DAY - 1);
  return `${pad(Math.floor(clamped / MINUTES_PER_HOUR))}:${pad(clamped % MINUTES_PER_HOUR)}`;
}

/** Minutes since midnight of the given moment in local time. */
export function minutesOfDay(now: Date): number {
  return now.getHours() * MINUTES_PER_HOUR + now.getMinutes();
}

/** Time range label such as "09:00–09:30". */
export function formatTimeRange(start: TimeOfDay, durationMin: number): string {
  const end = Math.min(toMinutes(start) + durationMin, MINUTES_PER_DAY - 1);
  return `${start}–${fromMinutes(end)}`;
}

/** Human-readable duration such as "30 min" or "1 h 30 min". */
export function formatDuration(durationMin: number): string {
  if (durationMin < MINUTES_PER_HOUR) return `${durationMin} min`;
  const hours = Math.floor(durationMin / MINUTES_PER_HOUR);
  const rest = durationMin % MINUTES_PER_HOUR;
  return rest === 0 ? `${hours} h` : `${hours} h ${rest} min`;
}
