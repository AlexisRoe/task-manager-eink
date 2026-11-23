import { NOTES_MAX_LENGTH, TITLE_MAX_LENGTH } from "@/constants/task.constants";
import { createId } from "@/utils/id.utils";
import {
  isHabit,
  isOccurrenceState,
  isPersistedTasks,
  isSeries,
  isTask,
  type TaskDraft,
  validateHabitTitle,
  validateTaskDraft,
} from "@/utils/validate.utils";

const draft: TaskDraft = {
  title: "  Write report ",
  start: "9:30",
  durationMin: 30,
  priority: 2,
  project: "Work",
  notes: "",
  repeat: "none",
};

const task = {
  id: "t1",
  date: "2026-11-19",
  done: false,
  carriedOver: false,
  title: "A",
  start: null,
  durationMin: 30,
  priority: 1,
  project: "Home",
  notes: "",
};

const habit = { id: "h1", title: "Read", startDate: "2026-11-19", endDate: null };

describe("validateTaskDraft", () => {
  it("normalizes a valid draft", () => {
    const result = validateTaskDraft(draft);
    expect(result).toEqual({
      ok: true,
      repeat: "none",
      value: {
        title: "Write report",
        start: "09:30",
        durationMin: 30,
        priority: 2,
        project: "Work",
        notes: "",
      },
    });
  });

  it("treats an empty start as Anytime", () => {
    const result = validateTaskDraft({ ...draft, start: "  " });
    expect(result.ok && result.value.start).toBeNull();
  });

  it("reports field errors", () => {
    const result = validateTaskDraft({
      ...draft,
      title: " ",
      start: "25:00",
      notes: "x".repeat(NOTES_MAX_LENGTH + 1),
    });
    expect(result).toEqual({
      ok: false,
      errors: {
        title: "Title is required",
        start: "Use a time like 9:30 or 14:00",
        notes: `Notes must be at most ${NOTES_MAX_LENGTH} characters`,
      },
    });
  });

  it("rejects over-long titles and unknown enum values", () => {
    const long = validateTaskDraft({ ...draft, title: "x".repeat(TITLE_MAX_LENGTH + 1) });
    expect(long.ok).toBe(false);
    expect(validateTaskDraft({ ...draft, durationMin: 20 }).ok).toBe(false);
    expect(validateTaskDraft({ ...draft, priority: 9 }).ok).toBe(false);
    expect(validateTaskDraft({ ...draft, project: "Evil" }).ok).toBe(false);
    expect(validateTaskDraft({ ...draft, repeat: "monthly" }).ok).toBe(false);
  });
});

describe("persisted guards", () => {
  it("accepts valid tasks and rejects tampered ones", () => {
    expect(isTask(task)).toBe(true);
    expect(isTask({ ...task, date: "2026-02-31" })).toBe(false);
    expect(isTask({ ...task, title: "" })).toBe(false);
    expect(isTask({ ...task, start: "9:00" })).toBe(false);
    expect(isTask({ ...task, priority: 5 })).toBe(false);
    expect(isTask(null)).toBe(false);
    expect(isTask([])).toBe(false);
  });

  it("validates series and occurrence state", () => {
    const series = { ...task, rule: "daily", anchorDate: "2026-11-19", endDate: null };
    expect(isSeries(series)).toBe(true);
    expect(isSeries({ ...series, rule: "hourly" })).toBe(false);
    expect(isSeries({ ...series, endDate: "bad" })).toBe(false);
    expect(isOccurrenceState({ done: true, skipped: false })).toBe(true);
    expect(isOccurrenceState({ done: "yes", skipped: false })).toBe(false);
  });

  it("validates habits", () => {
    expect(isHabit(habit)).toBe(true);
    expect(isHabit({ ...habit, endDate: "2026-11-20" })).toBe(true);
    expect(isHabit({ ...habit, endDate: "2026-11-19" })).toBe(false);
    expect(isHabit({ ...habit, endDate: "bad" })).toBe(false);
    expect(isHabit({ ...habit, startDate: "2026-02-31" })).toBe(false);
    expect(isHabit({ ...habit, title: "" })).toBe(false);
    expect(isHabit({ ...habit, title: "x".repeat(TITLE_MAX_LENGTH + 1) })).toBe(false);
    expect(isHabit({ ...habit, id: 1 })).toBe(false);
    expect(isHabit(null)).toBe(false);
  });

  it("validates the persisted root", () => {
    const root = {
      version: 2,
      tasks: [task],
      series: [],
      occurrences: {},
      carryDismissedOn: null,
      habits: [habit],
      habitChecks: { "h1:2026-11-19": true },
    };
    expect(isPersistedTasks(root)).toBe(true);
    expect(isPersistedTasks({ ...root, tasks: [{ ...task, id: 1 }] })).toBe(false);
    expect(isPersistedTasks({ ...root, occurrences: { a: 1 } })).toBe(false);
    expect(isPersistedTasks({ ...root, carryDismissedOn: "x" })).toBe(false);
    expect(isPersistedTasks({ ...root, habits: [{ ...habit, title: 3 }] })).toBe(false);
    expect(isPersistedTasks({ ...root, habitChecks: { a: false } })).toBe(false);
    expect(isPersistedTasks({ ...root, habitChecks: [] })).toBe(false);
    const { habits: _habits, habitChecks: _checks, ...v1 } = root;
    expect(isPersistedTasks(v1)).toBe(false);
    expect(isPersistedTasks("nope")).toBe(false);
  });
});

describe("validateHabitTitle", () => {
  it("trims, requires and length-limits the title", () => {
    expect(validateHabitTitle("  Read  ")).toEqual({ ok: true, value: "Read" });
    expect(validateHabitTitle("   ")).toEqual({ ok: false, error: "Title is required" });
    expect(validateHabitTitle("x".repeat(TITLE_MAX_LENGTH + 1)).ok).toBe(false);
  });
});

describe("createId", () => {
  it("creates unique ids", () => {
    expect(createId()).not.toBe(createId());
  });
});
