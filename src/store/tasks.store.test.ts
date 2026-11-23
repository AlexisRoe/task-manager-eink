import { createStore, get, set } from "idb-keyval";
import { PERSIST_KEY, SCHEMA_VERSION } from "@/config/storage.config";
import { HABITS_MAX_ACTIVE } from "@/constants/habit.constants";
import { createIdbStorage } from "@/store/idb.storage";
import { emptyPersistedTasks, migratePersistedTasks } from "@/store/tasks.migrations";
import { selectDayHabits, selectDayTasks } from "@/store/tasks.selectors";
import { createTasksStore } from "@/store/tasks.store";
import type { TaskInput } from "@/types/task.types";

const input: TaskInput = {
  title: "Plan",
  start: "09:00",
  durationMin: 30,
  priority: 2,
  project: "Work",
  notes: "",
};

let dbCounter = 0;
const freshStorage = () => createIdbStorage(`test-db-${dbCounter++}`, "state");

describe("tasks store", () => {
  it("adds one-off tasks and toggles them", () => {
    const store = createTasksStore(freshStorage());
    store.getState().addTask(input, "2026-11-19", "none");
    const [task] = store.getState().tasks;
    expect(task?.date).toBe("2026-11-19");
    store.getState().toggleDone({ source: "task", id: task?.id ?? "", date: "2026-11-19" });
    expect(store.getState().tasks[0]?.done).toBe(true);
  });

  it("creates a series that materializes and toggles per occurrence", () => {
    const store = createTasksStore(freshStorage());
    store.getState().addTask(input, "2026-11-19", "daily");
    const { series, tasks } = store.getState();
    expect(tasks).toHaveLength(0);
    const id = series[0]?.id ?? "";
    store.getState().toggleDone({ source: "series", id, date: "2026-11-20" });
    expect(selectDayTasks(store.getState(), "2026-11-20")[0]?.done).toBe(true);
    expect(selectDayTasks(store.getState(), "2026-11-21")[0]?.done).toBe(false);
    store.getState().toggleDone({ source: "series", id, date: "2026-11-20" });
    expect(selectDayTasks(store.getState(), "2026-11-20")[0]?.done).toBe(false);
  });

  it("moves a one-off task to tomorrow as carried over and undone", () => {
    const store = createTasksStore(freshStorage());
    store.getState().addTask(input, "2026-11-19", "none");
    const id = store.getState().tasks[0]?.id ?? "";
    store.getState().toggleDone({ source: "task", id, date: "2026-11-19" });
    store.getState().moveToTomorrow({ source: "task", id, date: "2026-11-19" });
    expect(store.getState().tasks[0]).toMatchObject({
      date: "2026-11-20",
      done: false,
      carriedOver: true,
    });
  });

  it("moves an occurrence by skipping it and copying it to the next day", () => {
    const store = createTasksStore(freshStorage());
    store.getState().addTask(input, "2026-11-19", "daily");
    const id = store.getState().series[0]?.id ?? "";
    store.getState().moveToTomorrow({ source: "series", id, date: "2026-11-19" });
    expect(selectDayTasks(store.getState(), "2026-11-19")).toHaveLength(0);
    const tomorrow = selectDayTasks(store.getState(), "2026-11-20");
    expect(tomorrow).toHaveLength(2);
    expect(tomorrow.some((t) => t.carriedOver && t.source === "task")).toBe(true);
  });

  it("ignores moving an unknown series", () => {
    const store = createTasksStore(freshStorage());
    store.getState().moveToTomorrow({ source: "series", id: "nope", date: "2026-11-19" });
    expect(store.getState().tasks).toHaveLength(0);
  });

  it("deletes tasks, skips occurrences and ends series", () => {
    const store = createTasksStore(freshStorage());
    store.getState().addTask(input, "2026-11-19", "none");
    store.getState().addTask(input, "2026-11-19", "daily");
    store.getState().deleteTask(store.getState().tasks[0]?.id ?? "");
    expect(store.getState().tasks).toHaveLength(0);

    const id = store.getState().series[0]?.id ?? "";
    store.getState().skipOccurrence(id, "2026-11-20");
    expect(selectDayTasks(store.getState(), "2026-11-20")).toHaveLength(0);

    store.getState().endSeriesFrom(id, "2026-11-22");
    expect(selectDayTasks(store.getState(), "2026-11-21")).toHaveLength(1);
    expect(selectDayTasks(store.getState(), "2026-11-22")).toHaveLength(0);

    store.getState().endSeriesFrom(id, "2026-11-19");
    expect(store.getState().series).toHaveLength(0);
    expect(Object.keys(store.getState().occurrences)).toHaveLength(0);
    store.getState().endSeriesFrom("missing", "2026-11-19");
  });

  it("carries over yesterday's open tasks and remembers dismissal", () => {
    const store = createTasksStore(freshStorage());
    store.getState().addTask(input, "2026-11-18", "none");
    store.getState().addTask({ ...input, title: "Done" }, "2026-11-18", "none");
    const doneId = store.getState().tasks[1]?.id ?? "";
    store.getState().toggleDone({ source: "task", id: doneId, date: "2026-11-18" });
    store.getState().carryOverToToday("2026-11-19");
    const [open, done] = store.getState().tasks;
    expect(open).toMatchObject({ date: "2026-11-19", carriedOver: true });
    expect(done?.date).toBe("2026-11-18");
    store.getState().dismissCarryOver("2026-11-19");
    expect(store.getState().carryDismissedOn).toBe("2026-11-19");
  });

  it("persists to IndexedDB and rehydrates", async () => {
    const storage = freshStorage();
    const first = createTasksStore(storage);
    await first.persist.rehydrate();
    first.getState().addTask(input, "2026-11-19", "none");
    await new Promise((resolve) => setTimeout(resolve, 20));

    const second = createTasksStore(storage);
    await second.persist.rehydrate();
    expect(second.getState().tasks).toHaveLength(1);
    expect(second.getState().recoveredFromCorruption).toBe(false);
  });

  it("resets corrupt persisted data and flags it", async () => {
    const name = `test-db-${dbCounter++}`;
    const raw = createStore(name, "state");
    await set(
      PERSIST_KEY,
      JSON.stringify({
        version: 1,
        state: {
          version: 1,
          tasks: [{ id: 1 }],
          series: [],
          occurrences: {},
          carryDismissedOn: null,
        },
      }),
      raw,
    );
    const store = createTasksStore(createIdbStorage(name, "state"));
    await store.persist.rehydrate();
    expect(store.getState().tasks).toHaveLength(0);
    expect(store.getState().recoveredFromCorruption).toBe(true);
    store.getState().acknowledgeRecovery();
    expect(store.getState().recoveredFromCorruption).toBe(false);
    expect(await get(PERSIST_KEY, raw)).toBeDefined();
  });

  it("adds habits up to the active limit and frees a slot on delete", () => {
    const store = createTasksStore(freshStorage());
    for (let i = 0; i < HABITS_MAX_ACTIVE; i += 1) {
      expect(store.getState().addHabit(`Habit ${i}`, "2026-11-19")).toBe(true);
    }
    expect(store.getState().addHabit("One too many", "2026-11-19")).toBe(false);
    expect(store.getState().habits).toHaveLength(HABITS_MAX_ACTIVE);
    store.getState().deleteHabit(store.getState().habits[0]?.id ?? "", "2026-11-20");
    expect(store.getState().addHabit("Now fits", "2026-11-20")).toBe(true);
  });

  it("renames habits and toggles them only within their active range", () => {
    const store = createTasksStore(freshStorage());
    store.getState().addHabit("Read", "2026-11-19");
    const id = store.getState().habits[0]?.id ?? "";
    store.getState().renameHabit(id, "Read 10 pages");
    expect(store.getState().habits[0]?.title).toBe("Read 10 pages");

    store.getState().toggleHabit(id, "2026-11-19");
    expect(selectDayHabits(store.getState(), "2026-11-19")[0]?.done).toBe(true);
    store.getState().toggleHabit(id, "2026-11-19");
    expect(selectDayHabits(store.getState(), "2026-11-19")[0]?.done).toBe(false);
    store.getState().toggleHabit(id, "2026-11-18");
    store.getState().toggleHabit("missing", "2026-11-19");
    expect(store.getState().habitChecks).toEqual({});
  });

  it("ends a habit on delete but keeps its past check-ins", () => {
    const store = createTasksStore(freshStorage());
    store.getState().addHabit("Read", "2026-11-19");
    const id = store.getState().habits[0]?.id ?? "";
    store.getState().toggleHabit(id, "2026-11-19");
    store.getState().deleteHabit(id, "2026-11-21");
    expect(store.getState().habits[0]?.endDate).toBe("2026-11-21");
    expect(selectDayHabits(store.getState(), "2026-11-19")[0]?.done).toBe(true);
    expect(selectDayHabits(store.getState(), "2026-11-21")).toHaveLength(0);
    store.getState().deleteHabit("missing", "2026-11-21");
  });

  it("removes a habit entirely when deleted on the day it started", () => {
    const store = createTasksStore(freshStorage());
    store.getState().addHabit("Read", "2026-11-19");
    const id = store.getState().habits[0]?.id ?? "";
    store.getState().toggleHabit(id, "2026-11-19");
    store.getState().deleteHabit(id, "2026-11-19");
    expect(store.getState().habits).toHaveLength(0);
    expect(store.getState().habitChecks).toEqual({});
  });

  it("upgrades version 1 data and persists habits", async () => {
    const name = `test-db-${dbCounter++}`;
    const raw = createStore(name, "state");
    const v1 = { version: 1, tasks: [], series: [], occurrences: {}, carryDismissedOn: null };
    await set(PERSIST_KEY, JSON.stringify({ version: 1, state: v1 }), raw);
    const storage = createIdbStorage(name, "state");
    const store = createTasksStore(storage);
    await store.persist.rehydrate();
    expect(store.getState().recoveredFromCorruption).toBe(false);
    expect(store.getState().habits).toEqual([]);
    store.getState().addHabit("Read", "2026-11-19");
    await new Promise((resolve) => setTimeout(resolve, 20));

    const second = createTasksStore(storage);
    await second.persist.rehydrate();
    expect(second.getState().habits.map((h) => h.title)).toEqual(["Read"]);
  });

  it("removes items through the storage adapter", async () => {
    const storage = freshStorage();
    await storage.setItem("k", "v");
    expect(await storage.getItem("k")).toBe("v");
    await storage.removeItem("k");
    expect(await storage.getItem("k")).toBeNull();
  });
});

describe("migratePersistedTasks", () => {
  it("upgrades version 1 data by adding empty habits", () => {
    const v1 = { version: 1, tasks: [], series: [], occurrences: {}, carryDismissedOn: null };
    expect(migratePersistedTasks(v1, 1)).toEqual(emptyPersistedTasks());
    expect(migratePersistedTasks(null, 1)).toBeNull();
  });

  it("accepts current data and rejects unknown versions or invalid shapes", () => {
    expect(migratePersistedTasks(emptyPersistedTasks(), SCHEMA_VERSION)).toEqual(
      emptyPersistedTasks(),
    );
    expect(migratePersistedTasks(emptyPersistedTasks(), 99)).toBeNull();
    expect(migratePersistedTasks(emptyPersistedTasks(), 0)).toBeNull();
    expect(migratePersistedTasks({ nope: true }, 1)).toBeNull();
  });
});
