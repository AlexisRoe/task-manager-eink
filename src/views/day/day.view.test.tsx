import { fireEvent, render, screen, within } from "@testing-library/react";
import { App } from "@/app/app.component";
import { PORTRAIT_QUERY } from "@/config/pwa.config";
import { useTasksStore } from "@/store/tasks.store";
import { resetUiStore, useUiStore } from "@/store/ui.store";
import { makeSeries, makeTask, seedTasks } from "@/test/fixtures.utils";
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
    expect(screen.queryByRole("button", { name: "Timeline" })).not.toBeInTheDocument();
    expect(screen.getByRole("region", { name: "Scheduled" })).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: "Draft roadmap" }).length).toBeGreaterThan(0);
  });

  it("shows one pane at a time in portrait", async () => {
    stubMatchMedia((query) => query === PORTRAIT_QUERY);
    await renderDay();
    expect(screen.queryByRole("region", { name: "Scheduled" })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "List" }));
    expect(screen.getByRole("region", { name: "Scheduled" })).toBeInTheDocument();
  });

  it("hides the today pill and banner on other days", async () => {
    useUiStore.setState({ date: addDays(today, 1) });
    await renderDay();
    expect(screen.queryByText("Today", { selector: ".eink-pill__label" })).not.toBeInTheDocument();
    expect(screen.queryByText(/unfinished/)).not.toBeInTheDocument();
  });
});
