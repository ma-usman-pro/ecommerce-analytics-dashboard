import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";

vi.mock("../api/analyticsApi", () => ({
  getCategories: vi.fn().mockResolvedValue([]),
}));

const { DashboardFilterProvider } = await import("../context/DashboardFilterContext");
const { DateRangeSelect } = await import("../components/dashboard/DateRangeSelect");

function renderPicker() {
  return render(
    <MemoryRouter>
      <DashboardFilterProvider>
        <DateRangeSelect />
      </DashboardFilterProvider>
    </MemoryRouter>
  );
}

// This app has no traditional data-entry forms (no create/edit record
// forms) — the nearest real analog to "form validation" is the custom
// date-range picker, which must not let a user construct an invalid
// range (end before start) through the UI.
describe("Custom date range validation", () => {
  it("only reveals the custom start/end date inputs after selecting Custom", async () => {
    const user = userEvent.setup();
    renderPicker();

    expect(screen.queryByLabelText("Custom range start date")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Custom" }));

    expect(screen.getByLabelText("Custom range start date")).toBeInTheDocument();
    expect(screen.getByLabelText("Custom range end date")).toBeInTheDocument();
  });

  it("constrains the end date input's minimum to the chosen start date", async () => {
    const user = userEvent.setup();
    renderPicker();
    await user.click(screen.getByRole("button", { name: "Custom" }));

    const startInput = screen.getByLabelText("Custom range start date");
    // fireEvent.change is used here (rather than userEvent.type) because
    // native <input type="date"> segment-editing behavior is unreliable
    // to simulate keystroke-by-keystroke in jsdom.
    fireEvent.change(startInput, { target: { value: "2026-08-15" } });

    const endInput = screen.getByLabelText("Custom range end date");
    expect(endInput).toHaveAttribute("min", "2026-08-15");
  });

  it("constrains the start date input's maximum to the chosen end date", async () => {
    const user = userEvent.setup();
    renderPicker();
    await user.click(screen.getByRole("button", { name: "Custom" }));

    const endInput = screen.getByLabelText("Custom range end date");
    fireEvent.change(endInput, { target: { value: "2026-08-20" } });

    const startInput = screen.getByLabelText("Custom range start date");
    expect(startInput).toHaveAttribute("max", "2026-08-20");
  });
});
