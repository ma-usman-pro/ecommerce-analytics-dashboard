import { describe, it, expect, vi, beforeEach } from "vitest";

const getMock = vi.fn();
vi.mock("../api/axios", () => ({
  default: { get: (...args) => getMock(...args) },
}));

const {
  getSummary,
  getRevenue,
  getOrdersAnalytics,
  getCategoryAnalytics,
  getOrderStatus,
  getTopProducts,
  getCategories,
} = await import("../api/analyticsApi");
const { getRecentOrders, getOrders } = await import("../api/ordersApi");

beforeEach(() => {
  getMock.mockReset();
});

describe("analyticsApi", () => {
  it("getSummary requests the right endpoint with filter params", async () => {
    getMock.mockResolvedValueOnce({ data: { success: true, data: { totalRevenue: 100 } } });
    const result = await getSummary({ startDate: "2026-08-01", endDate: "2026-08-31", category: "Electronics" });

    expect(getMock).toHaveBeenCalledWith("/analytics/summary", {
      params: { startDate: "2026-08-01", endDate: "2026-08-31", category: "Electronics" },
    });
    expect(result).toEqual({ totalRevenue: 100 });
  });

  it("getRevenue omits category when it is 'All'", async () => {
    getMock.mockResolvedValueOnce({ data: { success: true, data: [] } });
    await getRevenue({ startDate: "2026-08-01", endDate: "2026-08-31", category: "All" });

    expect(getMock).toHaveBeenCalledWith("/analytics/revenue", {
      params: { startDate: "2026-08-01", endDate: "2026-08-31" },
    });
  });

  it("getOrdersAnalytics hits /analytics/orders", async () => {
    getMock.mockResolvedValueOnce({ data: { success: true, data: [] } });
    await getOrdersAnalytics({ startDate: "2026-08-01", endDate: "2026-08-31" });
    expect(getMock).toHaveBeenCalledWith(
      "/analytics/orders",
      expect.objectContaining({ params: expect.any(Object) })
    );
  });

  it("getCategoryAnalytics hits /analytics/categories", async () => {
    getMock.mockResolvedValueOnce({ data: { success: true, data: [] } });
    await getCategoryAnalytics({});
    expect(getMock).toHaveBeenCalledWith("/analytics/categories", { params: {} });
  });

  it("getOrderStatus hits /analytics/order-status", async () => {
    getMock.mockResolvedValueOnce({ data: { success: true, data: [] } });
    await getOrderStatus({});
    expect(getMock).toHaveBeenCalledWith("/analytics/order-status", { params: {} });
  });

  it("getTopProducts passes the limit through", async () => {
    getMock.mockResolvedValueOnce({ data: { success: true, data: [] } });
    await getTopProducts({ limit: 10 });
    expect(getMock).toHaveBeenCalledWith("/analytics/top-products", { params: { limit: 10 } });
  });

  it("getCategories hits /categories with no params", async () => {
    getMock.mockResolvedValueOnce({ data: { success: true, data: ["Electronics"] } });
    const result = await getCategories();
    expect(getMock).toHaveBeenCalledWith("/categories");
    expect(result).toEqual(["Electronics"]);
  });

  it("propagates a rejected request as a rejected promise (caller handles it)", async () => {
    getMock.mockRejectedValueOnce(new Error("Network Error"));
    await expect(getSummary({})).rejects.toThrow("Network Error");
  });
});

describe("ordersApi", () => {
  it("getRecentOrders requests /orders/recent with a limit param", async () => {
    getMock.mockResolvedValueOnce({ data: { success: true, data: [] } });
    await getRecentOrders({ limit: 8 });
    expect(getMock).toHaveBeenCalledWith("/orders/recent", { params: { limit: 8 } });
  });

  it("getOrders returns the full envelope (data + pagination)", async () => {
    getMock.mockResolvedValueOnce({
      data: { success: true, data: [{ orderNumber: "ORD-1" }], pagination: { page: 1, limit: 10, total: 1, totalPages: 1 } },
    });
    const result = await getOrders({ page: 1, limit: 10 });
    expect(result.pagination).toEqual({ page: 1, limit: 10, total: 1, totalPages: 1 });
  });
});
