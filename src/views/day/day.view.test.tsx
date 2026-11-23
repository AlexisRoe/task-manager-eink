import { fireEvent, render, screen, within } from "@testing-library/react";
import { App } from "@/app/app.component";
import { PORTRAIT_QUERY } from "@/config/pwa.config";
import { useTasksStore } from "@/store/tasks.store";
import { resetUiStore, useUiStore } from "@/store/ui.store";
import { makeHabit, makeSeries, makeTask, seedTasks } from "@/test/fixtures.utils";
import { stubMatchMedia } from "@/test/match-media.utils";
import { addDays, todayIso } from "@/utils/date.utils";

const today = todayIso();
const yesterday = addDays(today, -1);

afterEach(() => stubMatchMedia());

beforeEach(() => {
  resetUiStore();
  seedTasks({
    tasks: [
      makeTask({
        id: "a",
        date: today,
        title: "Draft roadmap",
        start: "10:00",
        priority: 1,
        notes: "Send to Lena",
      }),
      makeTask({ id: "b", date: today, title: "Call mum", priority: 2 }),
      makeTask({ id: "old", date: yesterday, title: "Forgotten" }),
    ],
    series: [
      makeSeries({ id: "s", anchorDate: today, title: "Stretch", start: "07:30", durationMin: 15 }),
    ],
  });
});

const renderDay = async () => {
  render(<App />);
  await screen.findByText(/of \d+ done/);
};

describe("Day view", () => {
  it("shows progress, today pill and both sections", async () => {
    await renderDay();
    expect(screen.getByText("0 of 3 done")).toBeInTheDocument();
    expect(screen.getByText("Today", { selector: ".eink-pill__label" })).toBeInTheDocument();
    expect(
      within(screen.getByRole("region", { name: "Scheduled" })).getByText("Draft roadmap"),
    ).toBeInTheDocument();
    expect(
      within(screen.getByRole("region", { name: "Anytime" })).getByText("Call mum"),
    ).toBeInTheDocument();
  });

  it("toggles a one-off task and an occurrence", async () => {
    await renderDay();
    fireEvent.click(screen.getByRole("checkbox", { name: 'Mark "Call mum" as done' }));
    fireEvent.click(screen.getByRole("checkbox", { name: 'Mark "Stretch" as done' }));
    expect(screen.getByText("2 of 3 done")).toBeInTheDocument();
  });

  it("expands a row to show notes and hides the note hint", async () => {
    await renderDay();
    expect(screen.getByText(/Has note/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Draft roadmap/, expanded: false }));
    expect(screen.getByText("Send to Lena")).toBeInTheDocument();
    expect(screen.queryByText(/Has note/)).not.toBeInTheDocument();
  });

  it("moves a task to tomorrow", async () => {
    await renderDay();
    fireEvent.click(screen.getByRole("button", { name: /Call mum/, expanded: false }));
    fireEvent.click(screen.getByRole("button", { name: "Move to tomorrow" }));
    expect(screen.queryByText("Call mum")).not.toBeInTheDocument();
    const moved = useTasksStore.getState().tasks.find((t) => t.id === "b");
    expect(moved).toMatchObject({ date: addDays(today, 1), carriedOver: true });
  });

  it("deletes a one-off task and asks for recurring ones", async () => {
    await renderDay();
    fireEvent.click(screen.getByRole("button", { name: /Call mum/, expanded: false }));
    fireEvent.click(screen.getByRole("button", { name: "Delete" }));
    expect(screen.queryByText("Call mum")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Stretch/, expanded: false }));
    fireEvent.click(screen.getByRole("button", { name: "Delete" }));
    expect(useUiStore.getState().modal).toEqual({
      kind: "delete-recurring",
      seriesId: "s",
      date: today,
    });
  });

  it("offers the carry-over banner and moves yesterday's tasks", async () => {
    await renderDay();
    expect(screen.getByText("1 unfinished task from yesterday")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Move to today" }));
    expect(screen.queryByText(/unfinished/)).not.toBeInTheDocument();
    expect(screen.getByText("Forgotten")).toBeInTheDocument();
    expect(screen.getByText(/Carried over/)).toBeInTheDocument();
  });

  it("dismisses the carry-over banner with Leave", async () => {
    await renderDay();
    fireEvent.click(screen.getByRole("button", { name: "Leave" }));
    expect(screen.queryByText(/unfinished/)).not.toBeInTheDocument();
    expect(screen.queryByText("Forgotten")).not.toBeInTheDocument();
  });

  it("expands the row when a timeline block is pressed", async () => {
    await renderDay();
    fireEvent.click(screen.getByRole("button", { name: "Draft roadmap" }));
    expect(screen.getByText("Send to Lena")).toBeInTheDocument();
  });

  it("shows both panes and no toggle in landscape", async () => {
    await renderDay();
    expect(screen.queryByRole("switch", { name: "List" })).not.toBeInTheDocument();
    expect(screen.getByRole("region", { name: "Scheduled" })).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: "Draft roadmap" }).length).toBeGreaterThan(0);
  });

  it("shows one pane at a time in portrait, starting with the list", async () => {
    stubMatchMedia((query) => query === PORTRAIT_QUERY);
    await renderDay();
    expect(screen.getByRole("region", { name: "Scheduled" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Draft roadmap" })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("switch", { name: "List" }));
    expect(screen.queryByRole("region", { name: "Scheduled" })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("switch", { name: "List" }));
    expect(screen.getByRole("region", { name: "Scheduled" })).toBeInTheDocument();
  });

  it("hides the today pill and banner on other days", async () => {
    useUiStore.setState({ date: addDays(today, 1) });
    await renderDay();
    expect(screen.queryByText("Today", { selector: ".eink-pill__label" })).not.toBeInTheDocument();
    expect(screen.queryByText(/unfinished/)).not.toBeInTheDocument();
  });
});

describe("Day view habits", () => {
  beforeEach(() => {
    seedTasks({
      tasks: [makeTask({ id: "b", date: today, title: "Call mum" })],
      habits: [makeHabit({ id: "h", title: "Stretch", startDate: yesterday })],
    });
  });

  it("lists habits above the task lists without counting them as tasks", async () => {
    await renderDay();
    const habits = screen.getByRole("region", { name: "Habits" });
    expect(within(habits).getByText("Stretch")).toBeInTheDocument();
    expect(within(habits).getByText("0/1")).toBeInTheDocument();
    expect(screen.getByText("0 of 1 done")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("checkbox", { name: 'Mark habit "Stretch" as done' }));
    expect(within(habits).getByText("1/1")).toBeInTheDocument();
    expect(useTasksStore.getState().habitChecks).toEqual({ [`h:${today}`]: true });
    expect(screen.getByText("0 of 1 done")).toBeInTheDocument();
  });

  it("allows checking past days but not future days", async () => {
    useUiStore.setState({ date: addDays(today, 1) });
    await renderDay();
    expect(screen.getByRole("checkbox", { name: 'Mark habit "Stretch" as done' })).toBeDisabled();
  });

  it("hides the section on days before the habit started", async () => {
    useUiStore.setState({ date: addDays(yesterday, -1) });
    await renderDay();
    expect(screen.queryByRole("region", { name: "Habits" })).not.toBeInTheDocument();
  });

  it("opens edit and delete from an expanded habit row", async () => {
    await renderDay();
    fireEvent.click(screen.getByRole("button", { name: "Stretch" }));
    fireEvent.click(screen.getByRole("button", { name: "Edit" }));
    expect(useUiStore.getState().modal).toEqual({ kind: "edit-habit", id: "h" });
    useUiStore.getState().closeModal();
    fireEvent.click(await screen.findByRole("button", { name: "Delete" }));
    expect(useUiStore.getState().modal).toEqual({ kind: "delete-habit", id: "h" });
  });
});
