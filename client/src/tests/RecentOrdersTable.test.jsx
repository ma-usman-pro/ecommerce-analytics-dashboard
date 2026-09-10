import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

const recentOrdersState = { data: null, loading: false, error: null, refetch: vi.fn() };
vi.mock("../hooks/useRecentOrders", () => ({
  useRecentOrders: () => recentOrdersState,
}));

const { RecentOrdersTable } = await import("../components/dashboard/RecentOrdersTable");

function reset() {
  recentOrdersState.data = null;
  recentOrdersState.loading = false;
  recentOrdersState.error = null;
}

describe("RecentOrdersTable", () => {
  it("renders order number, customer, date, amount, and a status badge", () => {
    recentOrdersState.data = [
      {
        orderNumber: "ORD-100001",
        customer: { name: "Jane Doe" },
        date: "2026-08-30T10:00:00.000Z",
        items: [{}, {}],
        totalAmount: 89.99,
        status: "Completed",
      },
    ];
    render(<RecentOrdersTable />);
    expect(screen.getByText("ORD-100001")).toBeInTheDocument();
    expect(screen.getByText("Jane Doe")).toBeInTheDocument();
    expect(screen.getByText("$89.99")).toBeInTheDocument();
    expect(screen.getByText("Completed")).toBeInTheDocument();
    reset();
  });

  it("renders every controlled status with readable text (not color-only)", () => {
    const statuses = ["Completed", "Processing", "Pending", "Cancelled", "Refunded"];
    recentOrdersState.data = statuses.map((status, i) => ({
      orderNumber: `ORD-10000${i}`,
      customer: { name: "Test Customer" },
      date: "2026-08-01T00:00:00.000Z",
      items: [{}],
      totalAmount: 10,
      status,
    }));
    render(<RecentOrdersTable />);
    statuses.forEach((s) => expect(screen.getByText(s)).toBeInTheDocument());
    reset();
  });

  it("falls back to an em dash when a customer is missing", () => {
    recentOrdersState.data = [
      { orderNumber: "ORD-1", customer: null, date: "2026-08-01T00:00:00.000Z", items: [], totalAmount: 10, status: "Pending" },
    ];
    render(<RecentOrdersTable />);
    expect(screen.getByText("—")).toBeInTheDocument();
    reset();
  });

  it("shows the empty state when there are no recent orders", () => {
    recentOrdersState.data = [];
    render(<RecentOrdersTable />);
    expect(screen.getByText("No data available")).toBeInTheDocument();
    reset();
  });

  it("shows a retry-able error state on failure", () => {
    recentOrdersState.error = "Timed out";
    render(<RecentOrdersTable />);
    expect(screen.getByText("Timed out")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /retry/i })).toBeInTheDocument();
    reset();
  });
});
