import { fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { Segmented } from "./segmented.component";

function Harness() {
  const [view, setView] = useState("day");
  return (
    <Segmented value={view} onChange={setView} fullWidth className="x">
      <Segmented.Item id="day">Day</Segmented.Item>
      <Segmented.Item id="week">Week</Segmented.Item>
    </Segmented>
  );
}

describe("Segmented (candidate)", () => {
  it("follows the controlled value", () => {
    const { rerender } = render(
      <Segmented value="day">
        <Segmented.Item id="day">Day</Segmented.Item>
        <Segmented.Item id="week">Week</Segmented.Item>
      </Segmented>,
    );
    expect(screen.getByRole("button", { name: "Day" })).toHaveAttribute("aria-pressed", "true");
    rerender(
      <Segmented value="week">
        <Segmented.Item id="day">Day</Segmented.Item>
        <Segmented.Item id="week">Week</Segmented.Item>
      </Segmented>,
    );
    expect(screen.getByRole("button", { name: "Week" })).toHaveAttribute("aria-pressed", "true");
  });

  it("does not change selection on click when controlled, but reports it", () => {
    const onChange = vi.fn();
    render(
      <Segmented value="day" onChange={onChange}>
        <Segmented.Item id="day">Day</Segmented.Item>
        <Segmented.Item id="week">Week</Segmented.Item>
      </Segmented>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Week" }));
    expect(onChange).toHaveBeenCalledWith("week");
    expect(screen.getByRole("button", { name: "Day" })).toHaveAttribute("aria-pressed", "true");
  });

  it("works uncontrolled with defaultId", () => {
    render(
      <Segmented defaultId="day">
        <Segmented.Item id="day">Day</Segmented.Item>
        <Segmented.Item id="week">Week</Segmented.Item>
      </Segmented>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Week" }));
    expect(screen.getByRole("button", { name: "Week" })).toHaveAttribute("aria-pressed", "true");
  });

  it("can be driven by parent state", () => {
    render(<Harness />);
    fireEvent.click(screen.getByRole("button", { name: "Week" }));
    expect(screen.getByRole("button", { name: "Week" })).toHaveAttribute("aria-pressed", "true");
  });
});
