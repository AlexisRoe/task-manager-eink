import { fireEvent, render, screen } from "@testing-library/react";
import { App } from "@/app/app.component";
import { useTasksStore } from "@/store/tasks.store";
import { resetUiStore, useUiStore } from "@/store/ui.store";
import { makeTask, seedTasks } from "@/test/fixtures.utils";
import { addDays, formatFullDate, todayIso } from "@/utils/date.utils";

const today = todayIso();

beforeEach(() => {
  resetUiStore();
  useUiStore.setState({ view: "history" });
  seedTasks({
    tasks: [
      makeTask({ id: "t", date: today, title: "Today task" }),
      makeTask({ id: "y1", date: addDays(today, -1), title: "Done yesterday", done: true }),
      makeTask({ id: "y2", date: addDays(today, -2), title: "Done before", done: true }),
      makeTask({ id: "y3", date: addDays(today, -3), title: "Half", done: false }),
    ],
  });
});

describe("History view", () => {
  it("shows the headline statistics", async () => {
    render(<App />);
    expect(await screen.findByText("Current streak, 75% or more done")).toBeInTheDocument();
    expect(screen.getByText("Tasks done in the last 30 days")).toBeInTheDocument();
    expect(screen.getByText("Average completion, 18 weeks")).toBeInTheDocument();
    expect(screen.getAllByText("2")).toHaveLength(2);
  });

  it("selects a day from the heatmap and lists its tasks", async () => {
    render(<App />);
    expect(await screen.findByText("0 of 1 completed")).toBeInTheDocument();
    const yesterday = addDays(today, -1);
    const cell = (await screen.findAllByRole("button", { pressed: false })).find((button) =>
      button.getAttribute("aria-label")?.endsWith(`${formatFullDate(yesterday)}: 1 of 1 done`),
    );
    expect(cell).toBeDefined();
    fireEvent.click(cell as HTMLElement);
    expect(screen.getByText("Done yesterday")).toBeInTheDocument();
    expect(screen.getByText("1 of 1 completed")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Open this day" }));
    expect(useUiStore.getState()).toMatchObject({ view: "day" });
    expect(useUiStore.getState().date).toBe(yesterday);
  });

  it("toggles tasks of the selected day", async () => {
    render(<App />);
    fireEvent.click(await screen.findByRole("checkbox", { name: 'Mark "Today task" as done' }));
    expect(useTasksStore.getState().tasks.find((t) => t.id === "t")?.done).toBe(true);
    expect(screen.getByText("1 of 1 completed")).toBeInTheDocument();
  });

  it("hides future cells", async () => {
    render(<App />);
    await screen.findByText("SELECTED DAY");
    const labels = screen
      .getAllByRole("button")
      .map((button) => button.getAttribute("aria-label") ?? "");
    expect(labels.some((label) => label.includes(addDays(today, 8)))).toBe(false);
  });
});
