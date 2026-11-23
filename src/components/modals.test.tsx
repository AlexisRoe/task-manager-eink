import { fireEvent, render, screen } from "@testing-library/react";
import { App } from "@/app/app.component";
import { HABITS_MAX_ACTIVE } from "@/constants/habit.constants";
import { TITLE_MAX_LENGTH } from "@/constants/task.constants";
import { selectDayTasks } from "@/store/tasks.selectors";
import { useTasksStore } from "@/store/tasks.store";
import { resetUiStore, useUiStore } from "@/store/ui.store";
import { makeHabit, makeSeries, makeTask, seedTasks } from "@/test/fixtures.utils";
import { addDays, todayIso } from "@/utils/date.utils";

const today = todayIso();

beforeEach(() => {
  resetUiStore();
  seedTasks({});
});

const openNewTask = async () => {
  render(<App />);
  fireEvent.click(await screen.findByRole("button", { name: /New task/ }));
};

describe("New task modal", () => {
  it("requires a title", async () => {
    await openNewTask();
    fireEvent.click(await screen.findByRole("button", { name: "Add task" }));
    expect(await screen.findByText("Title is required")).toBeInTheDocument();
    expect(useTasksStore.getState().tasks).toHaveLength(0);
  });

  it("creates a one-off task with the chosen options", async () => {
    await openNewTask();
    fireEvent.change(await screen.findByRole("textbox", { name: /Title/ }), {
      target: { value: "  Write tests " },
    });
    fireEvent.click(screen.getByRole("button", { name: "1 h" }));
    fireEvent.click(screen.getByRole("button", { name: "P1" }));
    fireEvent.click(screen.getByRole("button", { name: "Health" }));
    fireEvent.click(screen.getByRole("button", { name: "Add task" }));
    expect(useTasksStore.getState().tasks[0]).toMatchObject({
      title: "Write tests",
      durationMin: 60,
      priority: 1,
      project: "Health",
      date: today,
      start: null,
    });
    expect(useUiStore.getState().modal).toEqual({ kind: "none" });
  });

  it("creates a recurring series when repeat is chosen", async () => {
    await openNewTask();
    fireEvent.change(await screen.findByRole("textbox", { name: /Title/ }), {
      target: { value: "Gym" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Weekdays" }));
    fireEvent.click(screen.getByRole("button", { name: "Add task" }));
    expect(useTasksStore.getState().tasks).toHaveLength(0);
    expect(useTasksStore.getState().series[0]).toMatchObject({
      rule: "weekdays",
      anchorDate: today,
    });
  });

  it("limits the title length", async () => {
    await openNewTask();
    expect(await screen.findByRole("textbox", { name: /Title/ })).toHaveAttribute(
      "maxlength",
      String(TITLE_MAX_LENGTH),
    );
  });

  it("closes on cancel without saving", async () => {
    await openNewTask();
    fireEvent.click(await screen.findByRole("button", { name: "Cancel" }));
    expect(useUiStore.getState().modal).toEqual({ kind: "none" });
    expect(useTasksStore.getState().tasks).toHaveLength(0);
  });
});

describe("Delete recurring modal", () => {
  const arrange = async () => {
    seedTasks({
      series: [makeSeries({ id: "s", anchorDate: addDays(today, -3), title: "Stretch" })],
    });
    render(<App />);
    await screen.findByText("0 of 1 done");
    useUiStore.getState().openModal({ kind: "delete-recurring", seriesId: "s", date: today });
  };

  it("deletes only this day", async () => {
    await arrange();
    fireEvent.click(await screen.findByRole("button", { name: "Delete" }));
    const state = useTasksStore.getState();
    expect(selectDayTasks(state, today)).toHaveLength(0);
    expect(selectDayTasks(state, addDays(today, 1))).toHaveLength(1);
  });

  it("deletes this and all future days", async () => {
    await arrange();
    fireEvent.click(await screen.findByLabelText("This and all future days"));
    fireEvent.click(screen.getByRole("button", { name: "Delete" }));
    const state = useTasksStore.getState();
    expect(selectDayTasks(state, addDays(today, -1))).toHaveLength(1);
    expect(selectDayTasks(state, today)).toHaveLength(0);
    expect(selectDayTasks(state, addDays(today, 1))).toHaveLength(0);
  });

  it("cancels without changes", async () => {
    await arrange();
    fireEvent.click(await screen.findByRole("button", { name: "Cancel" }));
    expect(selectDayTasks(useTasksStore.getState(), today)).toHaveLength(1);
  });
});

describe("Edit task modal", () => {
  it("edits a one-off task and keeps its state", async () => {
    seedTasks({ tasks: [makeTask({ id: "t1", date: today, title: "Old", done: true })] });
    render(<App />);
    fireEvent.click(await screen.findByRole("button", { name: /Old/ }));
    fireEvent.click(await screen.findByRole("button", { name: "Edit" }));
    const title = await screen.findByRole("textbox", { name: /Title/ });
    expect(title).toHaveValue("Old");
    fireEvent.change(title, { target: { value: "New" } });
    fireEvent.click(screen.getByRole("button", { name: "P1" }));
    fireEvent.click(screen.getByRole("button", { name: "Save" }));
    expect(useTasksStore.getState().tasks[0]).toMatchObject({
      id: "t1",
      title: "New",
      priority: 1,
      done: true,
    });
    expect(useUiStore.getState().modal).toEqual({ kind: "none" });
  });
});

describe("Habit modals", () => {
  const openNewHabit = async () => {
    render(<App />);
    fireEvent.click(await screen.findByRole("button", { name: /New habit/ }));
  };

  it("requires a title and creates a habit starting today", async () => {
    await openNewHabit();
    expect(await screen.findByText("0 of 7 habits active")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Add habit" }));
    expect(await screen.findByText("Title is required")).toBeInTheDocument();
    fireEvent.change(screen.getByRole("textbox", { name: /Title/ }), {
      target: { value: "  Stretch " },
    });
    fireEvent.click(screen.getByRole("button", { name: "Add habit" }));
    expect(useTasksStore.getState().habits[0]).toMatchObject({
      title: "Stretch",
      startDate: today,
      endDate: null,
    });
    expect(useUiStore.getState().modal).toEqual({ kind: "none" });
  });

  it("disables New habit once the maximum is active", async () => {
    seedTasks({
      habits: Array.from({ length: HABITS_MAX_ACTIVE }, (_, i) =>
        makeHabit({ id: `h${i}`, title: `Habit ${i}` }),
      ),
    });
    render(<App />);
    expect(await screen.findByRole("button", { name: /New habit/ })).toBeDisabled();
  });

  it("refuses to add beyond the maximum when opened anyway", async () => {
    seedTasks({
      habits: Array.from({ length: HABITS_MAX_ACTIVE }, (_, i) =>
        makeHabit({ id: `h${i}`, title: `Habit ${i}` }),
      ),
    });
    useUiStore.setState({ modal: { kind: "new-habit" } });
    render(<App />);
    fireEvent.change(await screen.findByRole("textbox", { name: /Title/ }), {
      target: { value: "Eighth" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Add habit" }));
    expect(await screen.findByText(/already have 7 active habits/)).toBeInTheDocument();
    expect(useTasksStore.getState().habits).toHaveLength(HABITS_MAX_ACTIVE);
  });

  it("renames a habit", async () => {
    seedTasks({ habits: [makeHabit({ id: "h", title: "Read" })] });
    useUiStore.setState({ modal: { kind: "edit-habit", id: "h" } });
    render(<App />);
    const input = await screen.findByRole("textbox", { name: /Title/ });
    expect(input).toHaveValue("Read");
    fireEvent.change(input, { target: { value: "Read 10 pages" } });
    fireEvent.click(screen.getByRole("button", { name: "Save" }));
    expect(useTasksStore.getState().habits[0]?.title).toBe("Read 10 pages");
  });

  it("deletes a habit but keeps its past check-ins", async () => {
    const start = addDays(today, -3);
    seedTasks({
      habits: [makeHabit({ id: "h", title: "Read", startDate: start })],
      habitChecks: { [`h:${start}`]: true },
    });
    useUiStore.setState({ modal: { kind: "delete-habit", id: "h" } });
    render(<App />);
    expect(await screen.findByText(/past check-ins stay in History/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Delete" }));
    expect(useTasksStore.getState().habits[0]?.endDate).toBe(today);
    expect(useTasksStore.getState().habitChecks).toEqual({ [`h:${start}`]: true });
  });

  it("renders nothing for an unknown habit", async () => {
    useUiStore.setState({ modal: { kind: "edit-habit", id: "missing" } });
    render(<App />);
    await screen.findByRole("button", { name: /New habit/ });
    expect(screen.queryByRole("textbox", { name: /Title/ })).not.toBeInTheDocument();
    useUiStore.setState({ modal: { kind: "delete-habit", id: "missing" } });
    expect(screen.queryByText(/past check-ins/)).not.toBeInTheDocument();
  });
});
