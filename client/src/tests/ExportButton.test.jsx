import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";

const getRevenueMock = vi.fn();
const getOrdersAnalyticsMock = vi.fn();
vi.mock("../api/analyticsApi", () => ({
  getRevenue: (...args) => getRevenueMock(...args),
  getOrdersAnalytics: (...args) => getOrdersAnalyticsMock(...args),
  getCategories: vi.fn().mockResolvedValue([]),
}));

// jsdom doesn't implement these — stub them so downloadCsv() doesn't throw.
URL.createObjectURL = vi.fn(() => "blob:mock");
URL.revokeObjectURL = vi.fn();

const { DashboardFilterProvider } = await import("../context/DashboardFilterContext");
const { ExportButton } = await import("../components/dashboard/ExportButton");

function renderButton() {
  return render(
    <MemoryRouter>
      <DashboardFilterProvider>
        <ExportButton />
      </DashboardFilterProvider>
    </MemoryRouter>
  );
}

describe("ExportButton", () => {
  it("renders an Export CSV button", () => {
    renderButton();
    expect(screen.getByRole("button", { name: /export csv/i })).toBeInTheDocument();
  });

  it("clicking Export fetches revenue+orders with the currently active filters, then shows success feedback", async () => {
    getRevenueMock.mockResolvedValueOnce([{ date: "2026-08-01", revenue: 1240 }]);
    getOrdersAnalyticsMock.mockResolvedValueOnce([{ date: "2026-08-01", orders: 24 }]);

    const user = userEvent.setup();
    renderButton();

    await user.click(screen.getByRole("button", { name: /export csv/i }));

    await waitFor(() => {
      expect(screen.getByText(/exported successfully/i)).toBeInTheDocument();
    });

    // Both calls should have received the same active filter shape
    // (default dashboard filters: no category, a computed date range).
    expect(getRevenueMock).toHaveBeenCalledWith(
      expect.objectContaining({ startDate: expect.any(String), endDate: expect.any(String) })
    );
    expect(getOrdersAnalyticsMock).toHaveBeenCalledWith(
      expect.objectContaining({ startDate: expect.any(String), endDate: expect.any(String) })
    );
  });

  it("shows an error message instead of freezing when the export request fails", async () => {
    getRevenueMock.mockRejectedValueOnce(new Error("Network Error"));
    getOrdersAnalyticsMock.mockResolvedValueOnce([]);

    const user = userEvent.setup();
    renderButton();
    await user.click(screen.getByRole("button", { name: /export csv/i }));

    await waitFor(() => {
      expect(screen.getByText("Network Error")).toBeInTheDocument();
    });
    // The button itself is still present and clickable — not frozen.
    expect(screen.getByRole("button", { name: /export csv/i })).toBeInTheDocument();
  });

  it("shows a no-data message rather than downloading an empty/malformed CSV", async () => {
    getRevenueMock.mockResolvedValueOnce([]);
    getOrdersAnalyticsMock.mockResolvedValueOnce([]);

    const user = userEvent.setup();
    renderButton();
    await user.click(screen.getByRole("button", { name: /export csv/i }));

    await waitFor(() => {
      expect(screen.getByText(/no data to export/i)).toBeInTheDocument();
    });
  });
});
