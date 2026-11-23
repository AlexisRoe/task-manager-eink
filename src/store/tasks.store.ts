import { create } from "zustand";
import { createJSONStorage, persist, type StateStorage } from "zustand/middleware";
import { PERSIST_KEY, SCHEMA_VERSION } from "@/config/storage.config";
import { HABITS_MAX_ACTIVE } from "@/constants/habit.constants";
import { createIdbStorage } from "@/store/idb.storage";
import { emptyPersistedTasks, migratePersistedTasks } from "@/store/tasks.migrations";
import type {
  Habit,
  IsoDate,
  OccurrenceState,
  PersistedTasks,
  RecurringSeries,
  RepeatOption,
  Task,
  TaskInput,
} from "@/types/task.types";
import { addDays, compareIso } from "@/utils/date.utils";
import { habitCheckKey, isHabitActiveOn, isHabitRunning } from "@/utils/habit.utils";
import { createId } from "@/utils/id.utils";
import { EMPTY_OCCURRENCE, endSeriesBefore, occurrenceKey } from "@/utils/recurrence.utils";

/** Identifies a task shown on a day, whether one-off or an occurrence of a series. */
export interface TaskRef {
  source: "task" | "series";
  id: string;
  date: IsoDate;
}

/** Task data plus the actions that change it. */
export interface TasksState extends PersistedTasks {
  /** True when stored data was unreadable and has been reset on load. */
  recoveredFromCorruption: boolean;
  /** Creates a one-off task, or a recurring series when `repeat` is not `none`. */
  addTask: (input: TaskInput, date: IsoDate, repeat: RepeatOption) => void;
  /** Replaces the editable fields of a one-off task or, for a series, of all its occurrences. */
  updateTask: (source: TaskRef["source"], id: string, input: TaskInput) => void;
  /** Flips the done state of a task or occurrence. */
  toggleDone: (ref: TaskRef) => void;
  /** Moves a task to the next day, marking it as carried over. */
  moveToTomorrow: (ref: TaskRef) => void;
  /** Removes a one-off task. */
  deleteTask: (id: string) => void;
  /** Skips a single occurrence of a series. */
  skipOccurrence: (seriesId: string, date: IsoDate) => void;
  /** Ends a series so it no longer occurs on `date` or later. */
  endSeriesFrom: (seriesId: string, date: IsoDate) => void;
  /** Moves all unfinished one-off tasks of yesterday to today. */
  carryOverToToday: (today: IsoDate) => void;
  /** Hides the carry-over banner for the given day. */
  dismissCarryOver: (today: IsoDate) => void;
  /** Hides the notice about reset data. */
  acknowledgeRecovery: () => void;
  /**
   * Starts a daily habit on `today`; returns `false` and changes nothing when the maximum number
   * of active habits is already reached.
   */
  addHabit: (title: string, today: IsoDate) => boolean;
  /** Changes the title of a habit, on all days. */
  renameHabit: (id: string, title: string) => void;
  /** Flips whether a habit is done on `date`; ignored when the habit is not active on that date. */
  toggleHabit: (id: string, date: IsoDate) => void;
  /** Ends a habit as of `today`, keeping past check-ins; a habit started today is removed entirely. */
  deleteHabit: (id: string, today: IsoDate) => void;
}

/** Plain data of the store, used for selectors and persistence. */
export type TasksData = Pick<
  PersistedTasks,
  "tasks" | "series" | "occurrences" | "carryDismissedOn" | "habits" | "habitChecks"
>;

const initialData = (): PersistedTasks => emptyPersistedTasks();

function oneOff(input: TaskInput, date: IsoDate, carriedOver: boolean): Task {
  return { ...input, id: createId(), date, done: false, carriedOver };
}

/**
 * Creates a task store persisted to the given storage (IndexedDB by default).
 * Persisted data is validated and migrated on load; unusable data is reset, never trusted.
 */
export function createTasksStore(storage: StateStorage = createIdbStorage()) {
  return create<TasksState>()(
    persist(
      (set, get) => ({
        ...initialData(),
        recoveredFromCorruption: false,

        addTask: (input, date, repeat) =>
          set((state) => {
            if (repeat === "none") return { tasks: [...state.tasks, oneOff(input, date, false)] };
            const series: RecurringSeries = {
              ...input,
              id: createId(),
              rule: repeat,
              anchorDate: date,
              endDate: null,
            };
            return { series: [...state.series, series] };
          }),

        updateTask: (source, id, input) =>
          set((state) =>
            source === "task"
              ? { tasks: state.tasks.map((t) => (t.id === id ? { ...t, ...input } : t)) }
              : { series: state.series.map((s) => (s.id === id ? { ...s, ...input } : s)) },
          ),

        toggleDone: ({ source, id, date }) =>
          set((state) => {
            if (source === "task") {
              return { tasks: state.tasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t)) };
            }
            const key = occurrenceKey(id, date);
            const current = state.occurrences[key] ?? EMPTY_OCCURRENCE;
            const next: OccurrenceState = { ...current, done: !current.done };
            return { occurrences: { ...state.occurrences, [key]: next } };
          }),

        moveToTomorrow: ({ source, id, date }) =>
          set((state) => {
            const tomorrow = addDays(date, 1);
            if (source === "task") {
              return {
                tasks: state.tasks.map((t) =>
                  t.id === id ? { ...t, date: tomorrow, done: false, carriedOver: true } : t,
                ),
              };
            }
            const series = state.series.find((s) => s.id === id);
            if (!series) return {};
            const key = occurrenceKey(id, date);
            const { id: _id, rule: _rule, anchorDate: _anchor, endDate: _end, ...input } = series;
            return {
              occurrences: {
                ...state.occurrences,
                [key]: { ...(state.occurrences[key] ?? EMPTY_OCCURRENCE), skipped: true },
              },
              tasks: [...state.tasks, oneOff(input, tomorrow, true)],
            };
          }),

        deleteTask: (id) => set((state) => ({ tasks: state.tasks.filter((t) => t.id !== id) })),

        skipOccurrence: (seriesId, date) =>
          set((state) => {
            const key = occurrenceKey(seriesId, date);
            return {
              occurrences: {
                ...state.occurrences,
                [key]: { ...(state.occurrences[key] ?? EMPTY_OCCURRENCE), skipped: true },
              },
            };
          }),

        endSeriesFrom: (seriesId, date) =>
          set((state) => {
            const series = state.series.find((s) => s.id === seriesId);
            if (!series) return {};
            const ended = endSeriesBefore(series, date);
            if (ended === null) {
              const prefix = `${seriesId}:`;
              return {
                series: state.series.filter((s) => s.id !== seriesId),
                occurrences: Object.fromEntries(
                  Object.entries(state.occurrences).filter(([key]) => !key.startsWith(prefix)),
                ),
              };
            }
            return { series: state.series.map((s) => (s.id === seriesId ? ended : s)) };
          }),

        carryOverToToday: (today) =>
          set((state) => {
            const yesterday = addDays(today, -1);
            return {
              tasks: state.tasks.map((t) =>
                t.date === yesterday && !t.done ? { ...t, date: today, carriedOver: true } : t,
              ),
            };
          }),

        dismissCarryOver: (today) => set({ carryDismissedOn: today }),

        acknowledgeRecovery: () => set({ recoveredFromCorruption: false }),

        addHabit: (title, today) => {
          const state = get();
          if (state.habits.filter(isHabitRunning).length >= HABITS_MAX_ACTIVE) return false;
          const habit: Habit = { id: createId(), title, startDate: today, endDate: null };
          set({ habits: [...state.habits, habit] });
          return true;
        },

        renameHabit: (id, title) =>
          set((state) => ({
            habits: state.habits.map((h) => (h.id === id ? { ...h, title } : h)),
          })),

        toggleHabit: (id, date) =>
          set((state) => {
            const habit = state.habits.find((h) => h.id === id);
            if (!habit || !isHabitActiveOn(habit, date)) return {};
            const key = habitCheckKey(id, date);
            const { [key]: checked, ...rest } = state.habitChecks;
            return { habitChecks: checked ? rest : { ...rest, [key]: true } };
          }),

        deleteHabit: (id, today) =>
          set((state) => {
            const habit = state.habits.find((h) => h.id === id);
            if (!habit) return {};
            if (compareIso(habit.startDate, today) >= 0) {
              const prefix = `${id}:`;
              return {
                habits: state.habits.filter((h) => h.id !== id),
                habitChecks: Object.fromEntries(
                  Object.entries(state.habitChecks).filter(([key]) => !key.startsWith(prefix)),
                ),
              };
            }
            return {
              habits: state.habits.map((h) => (h.id === id ? { ...h, endDate: today } : h)),
            };
          }),
      }),
      {
        name: PERSIST_KEY,
        version: SCHEMA_VERSION,
        storage: createJSONStorage(() => storage),
        partialize: (state): PersistedTasks => ({
          version: SCHEMA_VERSION,
          tasks: state.tasks,
          series: state.series,
          occurrences: state.occurrences,
          carryDismissedOn: state.carryDismissedOn,
          habits: state.habits,
          habitChecks: state.habitChecks,
        }),
        // Unusable data is passed through unchanged so `merge` rejects it and flags the reset.
        migrate: (persisted, version) =>
          (migratePersistedTasks(persisted, version) ?? persisted) as TasksState,
        merge: (persisted, current) => {
          const valid = migratePersistedTasks(persisted, SCHEMA_VERSION);
          if (valid === null) {
            const hadData = persisted !== undefined && persisted !== null;
            return { ...current, recoveredFromCorruption: hadData };
          }
          return { ...current, ...valid };
        },
      },
    ),
  );
}

/** Type of a task store created by {@link createTasksStore}. */
export type TasksStore = ReturnType<typeof createTasksStore>;

/** The app-wide task store, persisted to IndexedDB. */
export const useTasksStore = createTasksStore();
