import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

const revenueState = { data: null, loading: false, error: null, refetch: vi.fn() };
const ordersState = { data: null, loading: false, error: null, refetch: vi.fn() };
const categoryState = { data: null, loading: false, error: null, refetch: vi.fn() };
const statusState = { data: null, loading: false, error: null, refetch: vi.fn() };

vi.mock("../hooks/useRevenueChart", () => ({ useRevenueChart: () => revenueState }));
vi.mock("../hooks/useOrdersChart", () => ({ useOrdersChart: () => ordersState }));
vi.mock("../hooks/useCategoryChart", () => ({ useCategoryChart: () => categoryState }));
vi.mock("../hooks/useOrderStatusChart", () => ({ useOrderStatusChart: () => statusState }));

const { DashboardFilterProvider } = await import("../context/DashboardFilterContext");
const { ThemeProvider } = await import("../context/ThemeContext");
const { RevenueChart } = await import("../components/dashboard/RevenueChart");
const { OrdersChart } = await import("../components/dashboard/OrdersChart");
const { CategoryChart } = await import("../components/dashboard/CategoryChart");
const { OrderStatusChart } = await import("../components/dashboard/OrderStatusChart");

function withProviders(ui) {
  return (
    <MemoryRouter>
      <ThemeProvider>
        <DashboardFilterProvider>{ui}</DashboardFilterProvider>
      </ThemeProvider>
    </MemoryRouter>
  );
}

function resetState(state) {
  state.data = null;
  state.loading = false;
  state.error = null;
}

describe("RevenueChart", () => {
  it("renders with real data (no crash, no error/empty state shown)", () => {
    revenueState.data = [
      { date: "2026-08-01", revenue: 1240 },
      { date: "2026-08-02", revenue: 1580 },
    ];
    render(withProviders(<RevenueChart />));
    expect(screen.getByText("Revenue Overview")).toBeInTheDocument();
    expect(screen.queryByText("No data available")).not.toBeInTheDocument();
    resetState(revenueState);
  });

  it("shows the empty state when the filtered range has no revenue", () => {
    revenueState.data = [];
    render(withProviders(<RevenueChart />));
    expect(screen.getByText("No data available")).toBeInTheDocument();
    resetState(revenueState);
  });

  it("shows a loading skeleton while fetching", () => {
    revenueState.loading = true;
    const { container } = render(withProviders(<RevenueChart />));
    expect(container.querySelector(".animate-pulse")).toBeTruthy();
    resetState(revenueState);
  });

  it("shows a retry-able error state on API failure", () => {
    revenueState.error = "Network Error";
    render(withProviders(<RevenueChart />));
    expect(screen.getByText("Network Error")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /retry/i })).toBeInTheDocument();
    resetState(revenueState);
  });
});

describe("OrdersChart", () => {
  it("renders with real order-count data", () => {
    ordersState.data = [{ date: "2026-08-01", orders: 24 }];
    render(withProviders(<OrdersChart />));
    expect(screen.getByText("Orders Overview")).toBeInTheDocument();
    resetState(ordersState);
  });

  it("shows the empty state for a range with zero orders", () => {
    ordersState.data = [];
    render(withProviders(<OrdersChart />));
    expect(screen.getByText("No data available")).toBeInTheDocument();
    resetState(ordersState);
  });

  it("shows a loading skeleton while fetching", () => {
    ordersState.loading = true;
    const { container } = render(withProviders(<OrdersChart />));
    expect(container.querySelector(".animate-pulse")).toBeTruthy();
    resetState(ordersState);
  });
});

describe("CategoryChart", () => {
  it("displays each category's name, revenue, and computed share via the legend", () => {
    categoryState.data = [
      { category: "Electronics", revenue: 500 },
      { category: "Clothing", revenue: 300 },
      { category: "Home", revenue: 200 },
    ];
    render(withProviders(<CategoryChart />));
    expect(screen.getByText("Electronics")).toBeInTheDocument();
    expect(screen.getByText("Clothing")).toBeInTheDocument();
    expect(screen.getByText("Home")).toBeInTheDocument();
    // Percentages computed from real data (500+300+200=1000 total), never hardcoded.
    expect(screen.getByText("50.0%")).toBeInTheDocument();
    expect(screen.getByText("30.0%")).toBeInTheDocument();
    expect(screen.getByText("20.0%")).toBeInTheDocument();
    resetState(categoryState);
  });

  it("shows the empty state when no category has revenue", () => {
    categoryState.data = [];
    render(withProviders(<CategoryChart />));
    expect(screen.getByText("No data available")).toBeInTheDocument();
    resetState(categoryState);
  });
});

describe("OrderStatusChart", () => {
  it("handles all 5 controlled statuses, including zero counts", () => {
    statusState.data = [
      { status: "Completed", count: 5 },
      { status: "Processing", count: 2 },
      { status: "Pending", count: 1 },
      { status: "Cancelled", count: 1 },
      { status: "Refunded", count: 0 },
    ];
    render(withProviders(<OrderStatusChart />));
    ["Completed", "Processing", "Pending", "Cancelled", "Refunded"].forEach((s) => {
      expect(screen.getByText(s)).toBeInTheDocument();
    });
    resetState(statusState);
  });

  it("shows the empty state when there are zero orders total", () => {
    statusState.data = [
      { status: "Completed", count: 0 },
      { status: "Processing", count: 0 },
      { status: "Pending", count: 0 },
      { status: "Cancelled", count: 0 },
      { status: "Refunded", count: 0 },
    ];
    render(withProviders(<OrderStatusChart />));
    expect(screen.getByText("No data available")).toBeInTheDocument();
    resetState(statusState);
  });
});
