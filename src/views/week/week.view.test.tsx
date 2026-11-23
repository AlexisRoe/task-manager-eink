import { fireEvent, render, screen } from "@testing-library/react";
import { App } from "@/app/app.component";
import { selectDayStats } from "@/store/tasks.selectors";
import { useTasksStore } from "@/store/tasks.store";
import { resetUiStore, useUiStore } from "@/store/ui.store";
import { makeHabit, makeSeries, makeTask, seedTasks } from "@/test/fixtures.utils";
import { startOfWeek, todayIso } from "@/utils/date.utils";

const today = todayIso();
const monday = startOfWeek(today);

beforeEach(() => {
  resetUiStore();
  useUiStore.setState({ view: "week", date: today });
  seedTasks({
    tasks: [
      makeTask({ id: "a", date: monday, title: "Plan sprint", start: "09:00" }),
      makeTask({ id: "b", date: monday, title: "Groceries", done: true }),
    ],
    series: [makeSeries({ id: "s", anchorDate: monday, title: "Read", rule: "weekdays" })],
  });
});

describe("Week view", () => {
  it("shows the week number, progress and seven day columns", async () => {
    render(<App />);
    expect(await screen.findByRole("heading", { name: /^Week \d+$/ })).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: /^Open / })).toHaveLength(7);
    expect(screen.getByText(/^1 of \d+ done$/)).toBeInTheDocument();
  });

  it("lists scheduled tasks before anytime tasks within a day", async () => {
    render(<App />);
    await screen.findByRole("heading", { name: /^Week/ });
    const labels = screen.getAllByRole("checkbox").map((box) => box.getAttribute("aria-label"));
    expect(labels[0]).toBe('Mark "Plan sprint" as done');
  });

  it("toggles tasks from the week", async () => {
    render(<App />);
    fireEvent.click(await screen.findByRole("checkbox", { name: 'Mark "Plan sprint" as done' }));
    expect(selectDayStats(useTasksStore.getState(), monday).done).toBe(2);
  });

  it("opens a day from its header", async () => {
    render(<App />);
    fireEvent.click((await screen.findAllByRole("button", { name: /^Open / }))[2] as HTMLElement);
    expect(useUiStore.getState().view).toBe("day");
  });
});

describe("Week view habits toggle", () => {
  it("switches the same columns between tasks and habits", async () => {
    seedTasks({ habits: [makeHabit({ id: "h", title: "Stretch", startDate: monday })] });
    render(<App />);
    await screen.findByRole("heading", { name: /^Week/ });
    expect(screen.queryByText("Stretch")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("switch", { name: "Habits" }));
    expect(screen.getAllByText("Stretch").length).toBeGreaterThan(0);
    expect(screen.queryByText("Plan sprint")).not.toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: /^Open / })).toHaveLength(7);
  });
});
