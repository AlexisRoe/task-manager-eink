import { fireEvent, render, screen } from "@testing-library/react";
import { App } from "@/app/app.component";
import { resetUiStore, useUiStore } from "@/store/ui.store";

beforeEach(() => resetUiStore());

describe("App shell", () => {
  it("renders the header with the Day view active", async () => {
    render(<App />);
    expect(await screen.findByRole("button", { name: "Day" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.getByRole("button", { name: /New task/ })).toBeInTheDocument();
  });

  it("switches views and hides date navigation in History", async () => {
    render(<App />);
    fireEvent.click(await screen.findByRole("button", { name: "Week" }));
    expect(screen.getByRole("button", { name: "Week" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "Next week" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "History" }));
    expect(screen.queryByRole("navigation", { name: "Date navigation" })).not.toBeInTheDocument();
  });

  it("navigates days and returns to today", async () => {
    useUiStore.setState({ date: "2026-11-19" });
    render(<App />);
    fireEvent.click(await screen.findByRole("button", { name: "Next day" }));
    expect(useUiStore.getState().date).toBe("2026-11-20");
    fireEvent.click(screen.getByRole("button", { name: "Previous day" }));
    fireEvent.click(screen.getByRole("button", { name: "Today" }));
    expect(useUiStore.getState().date).not.toBe("2026-11-20");
  });

  it("opens the new-task modal state", async () => {
    render(<App />);
    fireEvent.click(await screen.findByRole("button", { name: /New task/ }));
    expect(useUiStore.getState().modal).toEqual({ kind: "new-task" });
  });
});
