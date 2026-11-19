import { resetUiStore, useUiStore } from "@/store/ui.store";

beforeEach(() => resetUiStore());

describe("ui store", () => {
  it("steps by a day in Day view and by a week in Week view", () => {
    useUiStore.setState({ date: "2026-11-19", view: "day" });
    useUiStore.getState().step(1);
    expect(useUiStore.getState().date).toBe("2026-11-20");
    useUiStore.getState().setView("week");
    useUiStore.getState().step(-1);
    expect(useUiStore.getState().date).toBe("2026-11-13");
  });

  it("resets to today and opens a day from other views", () => {
    useUiStore.getState().setView("history");
    useUiStore.getState().openDay("2026-10-01");
    expect(useUiStore.getState()).toMatchObject({ view: "day", date: "2026-10-01" });
    useUiStore.getState().goToday("2026-11-19");
    expect(useUiStore.getState().date).toBe("2026-11-19");
    useUiStore.getState().setDate("2026-11-01");
    expect(useUiStore.getState().date).toBe("2026-11-01");
  });

  it("toggles rows and collapses them on navigation", () => {
    useUiStore.getState().toggleRow("a");
    expect(useUiStore.getState().openRow).toBe("a");
    useUiStore.getState().toggleRow("a");
    expect(useUiStore.getState().openRow).toBeNull();
    useUiStore.getState().toggleRow("b");
    useUiStore.getState().step(1);
    expect(useUiStore.getState().openRow).toBeNull();
  });

  it("opens and closes modals", () => {
    useUiStore.getState().openModal({ kind: "new-task" });
    expect(useUiStore.getState().modal).toEqual({ kind: "new-task" });
    useUiStore.getState().closeModal();
    expect(useUiStore.getState().modal).toEqual({ kind: "none" });
  });
});
