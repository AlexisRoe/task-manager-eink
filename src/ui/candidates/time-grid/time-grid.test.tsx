import { fireEvent, render, screen } from "@testing-library/react";
import { TimeGrid, type TimeGridItem } from "./time-grid.component";
import { assignLanes } from "./time-grid.utils";

const items: TimeGridItem[] = [
  { id: "a", startMin: 540, durationMin: 60, content: "A", label: "Task A" },
  { id: "b", startMin: 555, durationMin: 15, content: "B", label: "Task B", done: true },
];

const baseProps = { startHour: 8, endHour: 12, hourHeight: 100, minBlockHeight: 40 };

describe("TimeGrid (candidate)", () => {
  it("renders hours and positions blocks by time", () => {
    render(<TimeGrid {...baseProps} items={items} />);
    expect(screen.getByText("08:00")).toBeInTheDocument();
    expect(screen.getByText("11:00")).toBeInTheDocument();
    expect(screen.queryByText("12:00")).not.toBeInTheDocument();
    const a = screen.getByRole("button", { name: "Task A" });
    expect(a.style.top).toBe("100px");
    expect(a.style.height).toBe("100px");
  });

  it("enforces the minimum height and places overlapping blocks side by side", () => {
    render(<TimeGrid {...baseProps} items={items} />);
    const b = screen.getByRole("button", { name: "Task B" });
    expect(b.style.height).toBe("40px");
    expect(b).toHaveClass("eink-time-grid__block--done");
    expect(b.style.width).toBe("50%");
    expect(b.style.left).toBe("50%");
  });

  it("calls onSelect and marks emphasis only when not done", () => {
    const onSelect = vi.fn();
    render(
      <TimeGrid
        {...baseProps}
        items={[
          {
            id: "p",
            startMin: 480,
            durationMin: 30,
            content: "P",
            label: "P",
            emphasis: true,
            onSelect,
          },
        ]}
      />,
    );
    const block = screen.getByRole("button", { name: "P" });
    expect(block).toHaveClass("eink-time-grid__block--emphasis");
    fireEvent.click(block);
    expect(onSelect).toHaveBeenCalled();
  });

  it("shows the now marker only inside the visible range", () => {
    const { rerender } = render(<TimeGrid {...baseProps} items={[]} nowMinutes={600} />);
    expect(screen.getByTestId("time-grid-now").style.top).toBe("200px");
    rerender(<TimeGrid {...baseProps} items={[]} nowMinutes={60} />);
    expect(screen.queryByTestId("time-grid-now")).not.toBeInTheDocument();
  });

  it("scrolls when the key changes", () => {
    const { container, rerender } = render(
      <TimeGrid
        {...baseProps}
        items={[]}
        scrollToMinutes={600}
        scrollKey="a"
        formatHour={(h) => `${h}h`}
      />,
    );
    const scroller = container.firstElementChild as HTMLElement;
    expect(scroller.scrollTop).toBe(200);
    expect(screen.getByText("8h")).toBeInTheDocument();
    scroller.scrollTop = 0;
    rerender(<TimeGrid {...baseProps} items={[]} scrollToMinutes={540} scrollKey="b" />);
    expect(scroller.scrollTop).toBe(100);
  });
});

describe("assignLanes", () => {
  it("gives non-overlapping intervals the full width", () => {
    const lanes = assignLanes([
      { id: "a", startMin: 0, durationMin: 30 },
      { id: "b", startMin: 30, durationMin: 30 },
    ]);
    expect(lanes.get("a")).toEqual({ lane: 0, lanes: 1 });
    expect(lanes.get("b")).toEqual({ lane: 0, lanes: 1 });
  });

  it("splits overlapping intervals into lanes", () => {
    const lanes = assignLanes([
      { id: "a", startMin: 0, durationMin: 60 },
      { id: "b", startMin: 10, durationMin: 20 },
      { id: "c", startMin: 40, durationMin: 10 },
    ]);
    expect(lanes.get("a")).toEqual({ lane: 0, lanes: 2 });
    expect(lanes.get("b")).toEqual({ lane: 1, lanes: 2 });
    expect(lanes.get("c")).toEqual({ lane: 1, lanes: 2 });
  });
});
