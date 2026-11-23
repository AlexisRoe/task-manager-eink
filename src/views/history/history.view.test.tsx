import { fireEvent, render, screen, within } from "@testing-library/react";
import { App } from "@/app/app.component";
import { PORTRAIT_QUERY } from "@/config/pwa.config";
import { useTasksStore } from "@/store/tasks.store";
import { resetUiStore, useUiStore } from "@/store/ui.store";
import { makeHabit, makeTask, seedTasks } from "@/test/fixtures.utils";
import { stubMatchMedia } from "@/test/match-media.utils";
import { addDays, formatFullDate, todayIso } from "@/utils/date.utils";

const today = todayIso();

afterEach(() => stubMatchMedia());

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
  it("shows the task and habit heatmaps without statistics", async () => {
    render(<App />);
    expect(
      await screen.findByLabelText("Task completion of the last 18 weeks"),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Habit completion of the last 18 weeks")).toBeInTheDocument();
    expect(screen.queryByText(/Current streak/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Average completion/)).not.toBeInTheDocument();
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

  it("shows one pane at a time in portrait and opens the day on selection", async () => {
    stubMatchMedia((query) => query === PORTRAIT_QUERY);
    render(<App />);
    expect(
      await screen.findByLabelText("Task completion of the last 18 weeks"),
    ).toBeInTheDocument();
    expect(screen.queryByText("SELECTED DAY")).not.toBeInTheDocument();
    const toggle = within(screen.getByLabelText("History layout"));
    fireEvent.click(toggle.getByRole("button", { name: "Day" }));
    expect(screen.getByText("SELECTED DAY")).toBeInTheDocument();
    expect(screen.queryByLabelText("Task completion of the last 18 weeks")).not.toBeInTheDocument();
    fireEvent.click(toggle.getByRole("button", { name: "Heatmaps" }));
    const yesterday = addDays(today, -1);
    const cell = screen
      .getAllByRole("button", { pressed: false })
      .find((button) =>
        button.getAttribute("aria-label")?.endsWith(`${formatFullDate(yesterday)}: 1 of 1 done`),
      );
    fireEvent.click(cell as HTMLElement);
    expect(screen.getByText("Done yesterday")).toBeInTheDocument();
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

describe("History view habits", () => {
  it("shows a separate habit heatmap and toggles habits of the selected day", async () => {
    const yesterday = addDays(today, -1);
    seedTasks({
      habits: [makeHabit({ id: "h", title: "Stretch", startDate: yesterday })],
      habitChecks: { [`h:${yesterday}`]: true },
    });
    render(<App />);
    expect(
      await screen.findByLabelText("Task completion of the last 18 weeks"),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Habit completion of the last 18 weeks")).toBeInTheDocument();
    const cell = screen
      .getAllByRole("button")
      .find((button) =>
        button
          .getAttribute("aria-label")
          ?.endsWith(`${formatFullDate(yesterday)}: 1 of 1 habits done`),
      );
    expect(cell).toBeDefined();
    expect(screen.getByText("0 of 1 habits")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("checkbox", { name: 'Mark habit "Stretch" as done' }));
    expect(useTasksStore.getState().habitChecks[`h:${today}`]).toBe(true);
    expect(screen.getByText("1 of 1 habits")).toBeInTheDocument();
  });
});
