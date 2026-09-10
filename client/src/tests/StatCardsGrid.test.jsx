import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

let callCount = 0;
const summaryMock = vi.fn();

vi.mock("../hooks/useSummary", () => ({
  useSummary: (...args) => summaryMock(...args),
}));

const { DashboardFilterProvider } = await import("../context/DashboardFilterContext");
const { StatCardsGrid } = await import("../components/dashboard/StatCardsGrid");

function renderGrid() {
  return render(
    <MemoryRouter>
      <DashboardFilterProvider>
        <StatCardsGrid />
      </DashboardFilterProvider>
    </MemoryRouter>
  );
}

describe("StatCardsGrid", () => {
  it("fetches summary for both the current and the previous period, and computes real trends", async () => {
    callCount = 0;
    summaryMock.mockImplementation(() => {
      callCount += 1;
      // First call (current period) resolves to this period's numbers;
      // second call (previous period, per useDashboardFilters+getPreviousRange)
      // resolves to the prior period's numbers.
      if (callCount === 1) {
        return { data: { totalRevenue: 150, totalOrders: 3, totalCustomers: 2, averageOrderValue: 50 }, loading: false, error: null };
      }
      return { data: { totalRevenue: 100, totalOrders: 2, totalCustomers: 2, averageOrderValue: 50 }, loading: false, error: null };
    });

    renderGrid();

    // Real trends, computed from the fixtures above (not invented):
    // Revenue 150 vs 100 = +50%, Orders 3 vs 2 = +50%,
    // Customers 2 vs 2 = 0%, AOV 50 vs 50 = 0%.
    await waitFor(() => {
      expect(screen.getAllByText("50% vs previous period")).toHaveLength(2);
    });
    expect(screen.getAllByText("0% vs previous period")).toHaveLength(2);
    expect(screen.getByText("$150.00")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("shows loading skeletons while the current-period summary is loading", () => {
    callCount = 0;
    summaryMock.mockImplementation(() => ({ data: null, loading: true, error: null }));
    const { container } = renderGrid();
    expect(container.querySelectorAll(".animate-pulse").length).toBeGreaterThan(0);
  });

  it("shows a retry-able error state when the summary request fails", () => {
    callCount = 0;
    summaryMock.mockImplementation(() => ({
      data: null,
      loading: false,
      error: "Database connection lost",
      refetch: vi.fn(),
    }));
    renderGrid();
    expect(screen.getByText("Database connection lost")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /retry/i })).toBeInTheDocument();
  });

  it("omits the trend (never shows a fake 0%) while the previous-period comparison is still loading", async () => {
    callCount = 0;
    summaryMock.mockImplementation(() => {
      callCount += 1;
      // Call 1 = current period (loaded), call 2 = previous period (still loading).
      if (callCount === 1) {
        return { data: { totalRevenue: 150, totalOrders: 3, totalCustomers: 2, averageOrderValue: 50 }, loading: false, error: null };
      }
      return { data: null, loading: true, error: null };
    });
    renderGrid();
    await waitFor(() => {
      expect(screen.getByText("$150.00")).toBeInTheDocument();
    });
    expect(screen.getAllByText("vs previous period: n/a").length).toBe(4);
  });
});
