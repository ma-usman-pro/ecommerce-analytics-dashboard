import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";

const app = require("../../app");
const Order = require("../../models/Order");
const Product = require("../../models/Product");

beforeEach(() => {
  vi.restoreAllMocks();
});

describe("GET /api/analytics/summary", () => {
  it("200s with success:true and the correct shape/types on the happy path", async () => {
    vi.spyOn(Order, "aggregate").mockResolvedValueOnce([
      { totalRevenue: 300, totalOrders: 3, customers: ["a", "b"] },
    ]);

    const res = await request(app).get("/api/analytics/summary");

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toEqual({
      totalRevenue: 300,
      totalOrders: 3,
      totalCustomers: 2,
      averageOrderValue: 100,
    });
    expect(typeof res.body.data.totalRevenue).toBe("number");
    expect(typeof res.body.data.averageOrderValue).toBe("number");
  });

  it("400s with a readable message when only startDate is given", async () => {
    const res = await request(app).get("/api/analytics/summary?startDate=2026-01-01");
    expect(res.status).toBe(400);
    expect(res.body).toEqual({
      success: false,
      message: expect.stringContaining("startDate and endDate"),
    });
  });

  it("400s on an invalid date format", async () => {
    const res = await request(app).get(
      "/api/analytics/summary?startDate=not-a-date&endDate=2026-01-31"
    );
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("400s when startDate is after endDate", async () => {
    const res = await request(app).get(
      "/api/analytics/summary?startDate=2026-03-01&endDate=2026-01-01"
    );
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/startDate cannot be after endDate/);
  });

  it("passes the category filter through to the aggregation", async () => {
    const spy = vi.spyOn(Order, "aggregate").mockResolvedValueOnce([
      { totalRevenue: 0, totalOrders: 0, customers: [] },
    ]);
    await request(app).get("/api/analytics/summary?category=Electronics");
    const pipeline = spy.mock.calls[0][0];
    expect(
      pipeline.some((s) => s.$match && s.$match["productDoc.category"] === "Electronics")
    ).toBe(true);
  });
});

describe("GET /api/analytics/revenue", () => {
  it("200s with a chronologically-shaped array on the happy path", async () => {
    vi.spyOn(Order, "aggregate").mockResolvedValueOnce([
      { _id: "2026-08-01", revenue: 1240 },
      { _id: "2026-08-02", revenue: 1580 },
    ]);
    const res = await request(app).get("/api/analytics/revenue");
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toEqual([
      { date: "2026-08-01", revenue: 1240 },
      { date: "2026-08-02", revenue: 1580 },
    ]);
  });

  it("returns an empty array (not an error) when nothing matches", async () => {
    vi.spyOn(Order, "aggregate").mockResolvedValueOnce([]);
    const res = await request(app).get("/api/analytics/revenue");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ success: true, data: [] });
  });
});

describe("GET /api/analytics/orders", () => {
  it("200s with order counts by date", async () => {
    vi.spyOn(Order, "aggregate").mockResolvedValueOnce([{ _id: "2026-08-01", orders: 24 }]);
    const res = await request(app).get("/api/analytics/orders");
    expect(res.status).toBe(200);
    expect(res.body.data).toEqual([{ date: "2026-08-01", orders: 24 }]);
  });
});

describe("GET /api/analytics/categories", () => {
  it("200s with revenue grouped by category", async () => {
    vi.spyOn(Order, "aggregate").mockResolvedValueOnce([
      { _id: "Electronics", revenue: 500 },
      { _id: "Clothing", revenue: 300 },
    ]);
    const res = await request(app).get("/api/analytics/categories");
    expect(res.status).toBe(200);
    expect(res.body.data).toEqual([
      { category: "Electronics", revenue: 500 },
      { category: "Clothing", revenue: 300 },
    ]);
  });
});

describe("GET /api/analytics/order-status", () => {
  it("200s with all 5 statuses present, zero-filled where needed", async () => {
    vi.spyOn(Order, "aggregate").mockResolvedValueOnce([{ _id: "Completed", count: 10 }]);
    const res = await request(app).get("/api/analytics/order-status");
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(5);
    expect(res.body.data).toContainEqual({ status: "Completed", count: 10 });
    expect(res.body.data).toContainEqual({ status: "Refunded", count: 0 });
  });
});

describe("GET /api/analytics/top-products", () => {
  it("200s with the default limit applied", async () => {
    vi.spyOn(Order, "aggregate").mockResolvedValueOnce([
      { product: "Wireless Headphones", category: "Electronics", unitsSold: 184, orders: 132, revenue: 9200 },
    ]);
    const res = await request(app).get("/api/analytics/top-products");
    expect(res.status).toBe(200);
    expect(res.body.data[0]).toEqual({
      product: "Wireless Headphones",
      category: "Electronics",
      unitsSold: 184,
      orders: 132,
      revenue: 9200,
    });
  });

  it("respects a valid custom limit", async () => {
    const spy = vi.spyOn(Order, "aggregate").mockResolvedValueOnce([]);
    await request(app).get("/api/analytics/top-products?limit=5");
    const pipeline = spy.mock.calls[0][0];
    expect(pipeline.at(-1)).toEqual({ $limit: 5 });
  });

  it("400s when limit exceeds the maximum", async () => {
    const res = await request(app).get("/api/analytics/top-products?limit=999");
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("400s on a non-numeric limit", async () => {
    const res = await request(app).get("/api/analytics/top-products?limit=abc");
    expect(res.status).toBe(400);
  });
});

describe("GET /api/categories", () => {
  it("200s with category names read live from Product.distinct, not hardcoded", async () => {
    vi.spyOn(Product, "distinct").mockResolvedValueOnce(["Clothing", "Electronics"]);
    const res = await request(app).get("/api/categories");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ success: true, data: ["Clothing", "Electronics"] });
  });
});

describe("unmatched routes", () => {
  it("404s with a readable message", async () => {
    const res = await request(app).get("/api/does-not-exist");
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/Route not found/);
  });
});
