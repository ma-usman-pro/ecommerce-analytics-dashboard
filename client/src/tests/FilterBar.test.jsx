import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";

vi.mock("../api/analyticsApi", () => ({
  getCategories: vi.fn().mockResolvedValue(["Electronics", "Clothing", "Home"]),
}));

const { DashboardFilterProvider, useDashboardFilters } = await import(
  "../context/DashboardFilterContext"
);
const { FilterBar } = await import("../components/dashboard/FilterBar");
const { DateRangeSelect } = await import("../components/dashboard/DateRangeSelect");
const { CategorySelect } = await import("../components/dashboard/CategorySelect");

function Harness() {
  const filters = useDashboardFilters();
  return (
    <div>
      <FilterBar />
      <div data-testid="state">
        {filters.preset}|{filters.category}|{filters.startDate}|{filters.endDate}
      </div>
    </div>
  );
}

function renderHarness() {
  return render(
    <MemoryRouter>
      <DashboardFilterProvider>
        <Harness />
      </DashboardFilterProvider>
    </MemoryRouter>
  );
}

describe("Filter bar rendering", () => {
  it("renders the date range selector with all presets", () => {
    render(
      <MemoryRouter>
        <DashboardFilterProvider>
          <DateRangeSelect />
        </DashboardFilterProvider>
      </MemoryRouter>
    );
    ["Today", "Last 7 Days", "Last 30 Days", "Last 90 Days", "This Year", "Custom"].forEach((label) => {
      expect(screen.getByText(label)).toBeInTheDocument();
    });
  });

  it("renders the category selector and loads options from the backend", async () => {
    render(
      <MemoryRouter>
        <DashboardFilterProvider>
          <CategorySelect />
        </DashboardFilterProvider>
      </MemoryRouter>
    );
    expect(await screen.findByRole("option", { name: "Electronics" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Clothing" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "All Categories" })).toBeInTheDocument();
  });
});

describe("Filter interaction", () => {
  it("selecting a category updates filter state (the same state analytics requests read from)", async () => {
    const user = userEvent.setup();
    renderHarness();

    await screen.findByRole("option", { name: "Electronics" });
    await user.selectOptions(screen.getByLabelText(/category/i, { selector: "select" }) || screen.getByRole("combobox"), "Electronics");

    await waitFor(() => {
      expect(screen.getByTestId("state").textContent).toContain("Electronics");
    });
  });

  it("changing the date range preset updates filter state to the matching computed range", async () => {
    const user = userEvent.setup();
    renderHarness();
    await screen.findByRole("option", { name: "Electronics" });

    await user.click(screen.getByRole("button", { name: "Last 7 Days" }));

    await waitFor(() => {
      expect(screen.getByTestId("state").textContent).toMatch(/^Last 7 Days\|/);
    });
  });

  it("Reset Filters restores the default preset and category", async () => {
    const user = userEvent.setup();
    renderHarness();
    await screen.findByRole("option", { name: "Electronics" });

    await user.click(screen.getByRole("button", { name: "Last 90 Days" }));
    await user.selectOptions(screen.getByRole("combobox"), "Electronics");
    await waitFor(() => expect(screen.getByTestId("state").textContent).toContain("Electronics"));

    await user.click(screen.getByRole("button", { name: /reset filters/i }));

    await waitFor(() => {
      const text = screen.getByTestId("state").textContent;
      expect(text).toMatch(/^Last 30 Days\|All\|/);
    });
  });

  it("Reset Filters button is hidden when already at the default state", async () => {
    renderHarness();
    await screen.findByRole("option", { name: "Electronics" });
    expect(screen.queryByRole("button", { name: /reset filters/i })).not.toBeInTheDocument();
  });
});
