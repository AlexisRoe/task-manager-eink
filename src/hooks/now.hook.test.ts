import { act, renderHook } from "@testing-library/react";
import { useNow } from "@/hooks/now.hook";

describe("useNow", () => {
  it("updates on every tick", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 10, 19, 10, 0));
    const { result } = renderHook(() => useNow(1000));
    expect(result.current.getMinutes()).toBe(0);
    act(() => {
      vi.advanceTimersByTime(60_000);
    });
    expect(result.current.getMinutes()).toBe(1);
    vi.useRealTimers();
  });
});
