import { describe, it, expect, vi, beforeEach } from "vitest";

// This backend is CommonJS. Vitest's `vi.mock()` module interception only
// applies to files reached through ESM `import`, not plain `require()` —
// and this project's modules require() each other. So instead of
// vi.mock-ing the Order model (which would silently NOT apply here),
// we require the real, shared Order singleton and vi.spyOn() the one
// method under test. Node's require cache guarantees analyticsService.js
// sees the exact same Order object we're spying on.
const Order = require("../../models/Order");
const {
  getSummary,
  getCategoryRevenue,
  getOrderStatusBreakdown,
} = require("../../services/analyticsService");

beforeEach(() => {
  vi.restoreAllMocks();
});

describe("getSummary — controlled-dataset correctness", () => {
  it("computes Revenue=$300, Orders=3, AOV=$100 from a known aggregate result", async () => {
    // Simulates 3 orders totalling $300, from 2 distinct customers (the
    // `customers` array here stands in for what Mongo's $addToSet would
    // already have deduplicated).
    vi.spyOn(Order, "aggregate").mockResolvedValueOnce([
      { totalRevenue: 300, totalOrders: 3, customers: ["cust1", "cust2"] },
    ]);

    const result = await getSummary({});

    expect(result.totalRevenue).toBe(300);
    expect(result.totalOrders).toBe(3);
    expect(result.totalCustomers).toBe(2);
    expect(result.averageOrderValue).toBe(100);
  });

  it("rounds revenue and AOV to 2 decimal places", async () => {
    vi.spyOn(Order, "aggregate").mockResolvedValueOnce([
      { totalRevenue: 100.005, totalOrders: 3, customers: ["a"] },
    ]);

    const result = await getSummary({});

    expect(result.totalRevenue).toBe(100.01);
    expect(result.averageOrderValue).toBe(33.34); // 100.01 / 3, rounded
  });

  it("returns all zeros with no division-by-zero when there are no matching orders", async () => {
    vi.spyOn(Order, "aggregate").mockResolvedValueOnce([]); // empty result set

    const result = await getSummary({});

    expect(result).toEqual({
      totalRevenue: 0,
      totalOrders: 0,
      totalCustomers: 0,
      averageOrderValue: 0,
    });
  });

  it("uses the category-aware pipeline (item-level $group) when category is provided", async () => {
    vi.spyOn(Order, "aggregate").mockResolvedValueOnce([
      { totalRevenue: 500, totalOrders: 5, customers: ["a", "b"] },
    ]);

    await getSummary({ category: "Electronics" });

    const pipeline = Order.aggregate.mock.calls[0][0];
    // The category-aware branch unwinds items and joins products before
    // grouping — verify that shape landed in the pipeline sent to Mongo.
    expect(pipeline.some((stage) => stage.$unwind === "$items")).toBe(true);
    expect(
      pipeline.some(
        (stage) => stage.$match && stage.$match["productDoc.category"] === "Electronics"
      )
    ).toBe(true);
  });

  it("applies the date filter as a $match stage when a range is provided", async () => {
    vi.spyOn(Order, "aggregate").mockResolvedValueOnce([{ totalRevenue: 0, totalOrders: 0, customers: [] }]);

    const start = new Date("2026-01-01T00:00:00.000Z");
    const end = new Date("2026-01-31T23:59:59.999Z");
    await getSummary({ startDate: start, endDate: end });

    const pipeline = Order.aggregate.mock.calls[0][0];
    expect(pipeline[0]).toEqual({
      $match: {
        createdAt: { $gte: start, $lte: end },
        // getSummary defaults to the revenue-bearing statuses unless an
        // explicit status was requested — expected here since none was.
        status: { $in: ["Completed", "Processing", "Pending"] },
      },
    });
  });
});

describe("getCategoryRevenue — controlled-dataset correctness", () => {
  it("returns Electronics=$500, Clothing=$300, Home=$200 unchanged and rounded", async () => {
    vi.spyOn(Order, "aggregate").mockResolvedValueOnce([
      { _id: "Electronics", revenue: 500 },
      { _id: "Clothing", revenue: 300 },
      { _id: "Home", revenue: 200 },
    ]);

    const result = await getCategoryRevenue({});

    expect(result).toEqual([
      { category: "Electronics", revenue: 500 },
      { category: "Clothing", revenue: 300 },
      { category: "Home", revenue: 200 },
    ]);
  });

  it("rounds fractional revenue to 2 decimals", async () => {
    vi.spyOn(Order, "aggregate").mockResolvedValueOnce([{ _id: "Electronics", revenue: 199.999 }]);
    const result = await getCategoryRevenue({});
    expect(result[0].revenue).toBe(200);
  });
});

describe("getOrderStatusBreakdown — controlled-dataset correctness", () => {
  it("returns Completed=5, Processing=2, Pending=1, Cancelled=1, Refunded=1 with all statuses present", async () => {
    vi.spyOn(Order, "aggregate").mockResolvedValueOnce([
      { _id: "Completed", count: 5 },
      { _id: "Processing", count: 2 },
      { _id: "Pending", count: 1 },
      { _id: "Cancelled", count: 1 },
      { _id: "Refunded", count: 1 },
    ]);

    const result = await getOrderStatusBreakdown({});

    expect(result).toEqual([
      { status: "Completed", count: 5 },
      { status: "Processing", count: 2 },
      { status: "Pending", count: 1 },
      { status: "Cancelled", count: 1 },
      { status: "Refunded", count: 1 },
    ]);
  });

  it("zero-fills statuses that had no matching orders (e.g. no Refunded orders in range)", async () => {
    vi.spyOn(Order, "aggregate").mockResolvedValueOnce([
      { _id: "Completed", count: 10 },
      { _id: "Pending", count: 3 },
      // Processing, Cancelled, Refunded absent from the raw Mongo result
    ]);

    const result = await getOrderStatusBreakdown({});
    const byStatus = Object.fromEntries(result.map((r) => [r.status, r.count]));

    expect(byStatus).toEqual({
      Completed: 10,
      Processing: 0,
      Pending: 3,
      Cancelled: 0,
      Refunded: 0,
    });
  });

  it("returns all-zero breakdown for a date range with no orders at all", async () => {
    vi.spyOn(Order, "aggregate").mockResolvedValueOnce([]);
    const result = await getOrderStatusBreakdown({});
    expect(result.every((r) => r.count === 0)).toBe(true);
    expect(result).toHaveLength(5);
  });
});
