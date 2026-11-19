import { NOTES_MAX_LENGTH, TITLE_MAX_LENGTH } from "@/constants/task.constants";
import { createId } from "@/utils/id.utils";
import {
  isOccurrenceState,
  isPersistedTasks,
  isSeries,
  isTask,
  type TaskDraft,
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

  it("validates the persisted root", () => {
    const root = { version: 1, tasks: [task], series: [], occurrences: {}, carryDismissedOn: null };
    expect(isPersistedTasks(root)).toBe(true);
    expect(isPersistedTasks({ ...root, tasks: [{ ...task, id: 1 }] })).toBe(false);
    expect(isPersistedTasks({ ...root, occurrences: { a: 1 } })).toBe(false);
    expect(isPersistedTasks({ ...root, carryDismissedOn: "x" })).toBe(false);
    expect(isPersistedTasks("nope")).toBe(false);
  });
});

describe("createId", () => {
  it("creates unique ids", () => {
    expect(createId()).not.toBe(createId());
  });
});
