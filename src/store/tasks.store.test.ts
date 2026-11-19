import { createStore, get, set } from "idb-keyval";
import { PERSIST_KEY } from "@/config/storage.config";
import { createIdbStorage } from "@/store/idb.storage";
import { emptyPersistedTasks, migratePersistedTasks } from "@/store/tasks.migrations";
import { selectDayTasks } from "@/store/tasks.selectors";
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

  it("removes items through the storage adapter", async () => {
    const storage = freshStorage();
    await storage.setItem("k", "v");
    expect(await storage.getItem("k")).toBe("v");
    await storage.removeItem("k");
    expect(await storage.getItem("k")).toBeNull();
  });
});

describe("migratePersistedTasks", () => {
  it("accepts current data and rejects unknown versions or invalid shapes", () => {
    expect(migratePersistedTasks(emptyPersistedTasks(), 1)).toEqual(emptyPersistedTasks());
    expect(migratePersistedTasks(emptyPersistedTasks(), 99)).toBeNull();
    expect(migratePersistedTasks(emptyPersistedTasks(), 0)).toBeNull();
    expect(migratePersistedTasks({ nope: true }, 1)).toBeNull();
  });
});
