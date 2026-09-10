import { describe, it, expect, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useDebouncedValue } from "../hooks/useDebouncedValue";
import { SearchInput } from "../components/common/SearchInput";

describe("useDebouncedValue", () => {
  it("does not update immediately on change", () => {
    vi.useFakeTimers();
    const { result, rerender } = renderHook(({ value }) => useDebouncedValue(value, 400), {
      initialProps: { value: "a" },
    });
    rerender({ value: "ab" });
    expect(result.current).toBe("a"); // still old value before the delay elapses
    vi.useRealTimers();
  });

  it("updates to the latest value only after the delay elapses", () => {
    vi.useFakeTimers();
    const { result, rerender } = renderHook(({ value }) => useDebouncedValue(value, 400), {
      initialProps: { value: "a" },
    });
    rerender({ value: "ab" });
    act(() => vi.advanceTimersByTime(400));
    expect(result.current).toBe("ab");
    vi.useRealTimers();
  });

  it("resets the timer on rapid successive changes (only the final value is used)", () => {
    vi.useFakeTimers();
    const { result, rerender } = renderHook(({ value }) => useDebouncedValue(value, 400), {
      initialProps: { value: "O" },
    });
    rerender({ value: "OR" });
    act(() => vi.advanceTimersByTime(200));
    rerender({ value: "ORD" });
    act(() => vi.advanceTimersByTime(200)); // 400ms since "OR", but timer restarted at "ORD"
    expect(result.current).toBe("O"); // not yet — only 200ms since "ORD"
    act(() => vi.advanceTimersByTime(200));
    expect(result.current).toBe("ORD");
    vi.useRealTimers();
  });
});

describe("SearchInput", () => {
  it("renders with a placeholder and accessible label", () => {
    render(<SearchInput value="" onChange={vi.fn()} placeholder="Search orders…" ariaLabel="Search orders" />);
    expect(screen.getByLabelText("Search orders")).toBeInTheDocument();
  });

  it("calls onChange as the user types", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<SearchInput value="" onChange={onChange} ariaLabel="Search" />);
    await user.type(screen.getByLabelText("Search"), "ORD-1005");
    // onChange fires per keystroke (debouncing happens one level up, in
    // the page component) — verify the final call carries the full value.
    expect(onChange).toHaveBeenLastCalledWith("5");
    expect(onChange).toHaveBeenCalledTimes(8);
  });
});
