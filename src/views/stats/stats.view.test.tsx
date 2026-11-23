import { fireEvent, render, screen } from "@testing-library/react";
import { App } from "@/app/app.component";
import { PORTRAIT_QUERY } from "@/config/pwa.config";
import { resetUiStore, useUiStore } from "@/store/ui.store";
import { makeHabit, makeTask, seedTasks } from "@/test/fixtures.utils";
import { stubMatchMedia } from "@/test/match-media.utils";
import { addDays, todayIso } from "@/utils/date.utils";
import { habitCheckKey } from "@/utils/habit.utils";

const today = todayIso();
const yesterday = addDays(today, -1);

afterEach(() => stubMatchMedia());

beforeEach(() => {
  resetUiStore();
  useUiStore.setState({ view: "stats" });
  seedTasks({
    tasks: [
      makeTask({ id: "a", date: yesterday, title: "Done", done: true }),
      makeTask({ id: "b", date: yesterday, title: "Open" }),
    ],
    habits: [makeHabit({ id: "h", title: "Stretch", startDate: addDays(today, -2) })],
    habitChecks: { [habitCheckKey("h", yesterday)]: true },
  });
});

describe("Stats view", () => {
  it("shows the headline, habit streaks and charts side by side in landscape", async () => {
    render(<App />);
    expect(await screen.findByRole("heading", { name: "Stats" })).toBeInTheDocument();
    expect(screen.getByLabelText("Habit streaks")).toBeInTheDocument();
    expect(screen.getByText("Stretch")).toBeInTheDocument();
    expect(screen.getByLabelText("Weekly trend")).toBeInTheDocument();
    expect(screen.getByLabelText("By project")).toBeInTheDocument();
  });

  it("splits habits and tasks into panes in portrait", async () => {
    stubMatchMedia((query) => query === PORTRAIT_QUERY);
    render(<App />);
    expect(await screen.findByLabelText("Weekly trend")).toBeInTheDocument();
    expect(screen.queryByLabelText("Habit streaks")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("switch", { name: "Habits" }));
    expect(screen.getByLabelText("Habit streaks")).toBeInTheDocument();
    expect(screen.queryByLabelText("Weekly trend")).not.toBeInTheDocument();
  });
});
