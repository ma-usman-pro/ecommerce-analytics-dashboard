import { describe, it, expect, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";

const topProductsState = { data: null, loading: false, error: null, refetch: vi.fn() };
vi.mock("../hooks/useTopProducts", () => ({
  useTopProducts: (filters, limit) => {
    topProductsState.lastLimit = limit;
    return topProductsState;
  },
}));

const { DashboardFilterProvider } = await import("../context/DashboardFilterContext");
const { TopProductsTable } = await import("../components/dashboard/TopProductsTable");

function renderTable() {
  return render(
    <MemoryRouter>
      <DashboardFilterProvider>
        <TopProductsTable />
      </DashboardFilterProvider>
    </MemoryRouter>
  );
}

const SAMPLE = [
  { product: "Wireless Headphones", category: "Electronics", unitsSold: 184, orders: 132, revenue: 9200 },
  { product: "Smart Watch", category: "Electronics", unitsSold: 156, orders: 118, revenue: 8420 },
  { product: "Mechanical Keyboard", category: "Electronics", unitsSold: 90, orders: 60, revenue: 4000 },
];

function reset() {
  topProductsState.data = null;
  topProductsState.loading = false;
  topProductsState.error = null;
}

describe("TopProductsTable", () => {
  it("renders product names, categories, units sold, and revenue", () => {
    topProductsState.data = SAMPLE;
    renderTable();
    expect(screen.getByText("Wireless Headphones")).toBeInTheDocument();
    expect(screen.getByText("Smart Watch")).toBeInTheDocument();
    expect(screen.getByText("Mechanical Keyboard")).toBeInTheDocument();
    expect(screen.getAllByText("Electronics").length).toBeGreaterThan(0);
    expect(screen.getByText("$9,200.00")).toBeInTheDocument();
    reset();
  });

  it("defaults to Top 5 and switching to Top 10 requests a new limit from the backend", async () => {
    topProductsState.data = SAMPLE;
    const user = userEvent.setup();
    renderTable();
    expect(topProductsState.lastLimit).toBe(5);

    await user.click(screen.getByRole("button", { name: "Top 10" }));
    expect(topProductsState.lastLimit).toBe(10);
    reset();
  });

  it("sorting by Units Sold reorders rows without changing the fetched dataset", async () => {
    topProductsState.data = SAMPLE; // already sorted by revenue desc
    const user = userEvent.setup();
    renderTable();

    await user.click(screen.getByRole("button", { name: /sort by units sold/i }));

    const rows = screen.getAllByRole("row").slice(1); // skip header row
    const firstDataRow = within(rows[0]);
    // Highest unitsSold (184) is already Wireless Headphones, so sort by
    // units sold desc should keep it first; sort again to flip ascending.
    expect(firstDataRow.getByText("Wireless Headphones")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /sort by units sold/i }));
    const rowsAsc = screen.getAllByRole("row").slice(1);
    expect(within(rowsAsc[0]).getByText("Mechanical Keyboard")).toBeInTheDocument();
    reset();
  });

  it("shows the empty state when no products match the filters", () => {
    topProductsState.data = [];
    renderTable();
    expect(screen.getByText("No data available")).toBeInTheDocument();
    reset();
  });

  it("shows a retry-able error state on failure", () => {
    topProductsState.error = "Server error";
    renderTable();
    expect(screen.getByText("Server error")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /retry/i })).toBeInTheDocument();
    reset();
  });
});
