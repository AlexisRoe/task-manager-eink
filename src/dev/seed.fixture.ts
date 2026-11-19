import type { TasksStore } from "@/store/tasks.store";
import type { RecurringSeries, Task } from "@/types/task.types";
import { addDays, todayIso } from "@/utils/date.utils";

const base = { durationMin: 30, priority: 3, project: "Work", notes: "" } as const;

const task = (id: string, date: string, title: string, over: Partial<Task> = {}): Task => ({
  ...base,
  id,
  date,
  title,
  start: null,
  done: false,
  carriedOver: false,
  ...over,
});

/** Demo content mirroring the prototype, anchored on today, for local development only. */
export function demoData(today: string): { tasks: Task[]; series: RecurringSeries[] } {
  const series: RecurringSeries[] = [
    {
      ...base,
      id: "demo-pages",
      title: "Morning pages",
      rule: "daily",
      anchorDate: addDays(today, -60),
      endDate: null,
      start: "07:30",
      durationMin: 15,
      project: "Personal",
    },
    {
      ...base,
      id: "demo-standup",
      title: "Team standup",
      rule: "weekdays",
      anchorDate: addDays(today, -60),
      endDate: null,
      start: "09:30",
      durationMin: 15,
    },
    {
      ...base,
      id: "demo-mum",
      title: "Call mum",
      rule: "weekly",
      anchorDate: addDays(today, -56),
      endDate: null,
      start: null,
      project: "Personal",
      priority: 3,
    },
  ];
  const tasks: Task[] = [
    task("demo-1", today, "Draft Q1 roadmap", {
      start: "10:00",
      durationMin: 90,
      priority: 1,
      notes: "Focus on onboarding metrics.",
    }),
    task("demo-2", today, "Lunch with Mara", {
      start: "12:30",
      durationMin: 60,
      project: "Personal",
      notes: "Bring the book.",
    }),
    task("demo-3", today, "Review supplier contract", {
      start: "14:00",
      durationMin: 60,
      priority: 1,
      notes: "Check clause 7.",
    }),
    task("demo-4", today, "Dentist", {
      start: "16:30",
      priority: 2,
      project: "Health",
      notes: "Bring insurance card.",
    }),
    task("demo-5", today, "Pay electricity bill", { project: "Home", done: true }),
    task("demo-6", today, "Buy birthday gift for Jonas", {
      project: "Personal",
      priority: 2,
      notes: "Something blue.",
    }),
    task("demo-7", addDays(today, -1), "Send invoice", { start: "15:00" }),
  ];
  return { tasks, series };
}

/** Fills an empty store with demo data once persisted state has loaded. */
export async function seedDemoDataWhenEmpty(store: TasksStore): Promise<void> {
  if (!store.persist.hasHydrated()) await store.persist.rehydrate();
  const { tasks, series } = store.getState();
  if (tasks.length > 0 || series.length > 0) return;
  store.setState(demoData(todayIso()));
}
