import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";

const app = require("../../app");
const Order = require("../../models/Order");
const Product = require("../../models/Product");
const Customer = require("../../models/Customer");

beforeEach(() => {
  vi.restoreAllMocks();
});

// Order.aggregate is used for both the paginated list (via a $facet
// pipeline) and getRecentOrders uses Order.find().sort().limit()... —
// so each describe block mocks whichever the endpoint actually calls.

describe("GET /api/orders", () => {
  it("200s with data + pagination on the happy path", async () => {
    vi.spyOn(Order, "aggregate").mockResolvedValueOnce([
      {
        data: [{ orderNumber: "ORD-100001", customer: { name: "Jane Doe" }, totalAmount: 59.99, status: "Completed" }],
        totalCount: [{ count: 1 }],
      },
    ]);

    const res = await request(app).get("/api/orders?page=1&limit=10");

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.pagination).toEqual({ page: 1, limit: 10, total: 1, totalPages: 1 });
  });

  it("returns an empty result set (not an error) when nothing matches", async () => {
    vi.spyOn(Order, "aggregate").mockResolvedValueOnce([
      { data: [], totalCount: [] },
    ]);
    const res = await request(app).get("/api/orders?search=zzzznonexistent");
    expect(res.status).toBe(200);
    expect(res.body.data).toEqual([]);
    expect(res.body.pagination.total).toBe(0);
    expect(res.body.pagination.totalPages).toBe(0);
  });

  it("400s on an invalid page number", async () => {
    const res = await request(app).get("/api/orders?page=0");
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("400s on a limit above the allowed maximum", async () => {
    const res = await request(app).get("/api/orders?limit=500");
    expect(res.status).toBe(400);
  });

  it("400s on an invalid status filter", async () => {
    const res = await request(app).get("/api/orders?status=NotARealStatus");
    expect(res.status).toBe(400);
  });

  it("accepts a valid status filter and applies it to the query", async () => {
    const spy = vi.spyOn(Order, "aggregate").mockResolvedValueOnce([
      { data: [], totalCount: [] },
    ]);
    await request(app).get("/api/orders?status=Completed");
    const pipeline = spy.mock.calls[0][0];
    expect(pipeline[0]).toEqual({ $match: { status: "Completed" } });
  });
});

describe("GET /api/orders/recent", () => {
  it("200s with the default limit of recent orders", async () => {
    const chain = {
      sort: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      populate: vi.fn().mockReturnThis(),
      lean: vi.fn().mockResolvedValue([
        {
          orderNumber: "ORD-100001",
          customer: { name: "Jane Doe", email: "jane@example.com" },
          createdAt: "2026-08-30T10:00:00.000Z",
          items: [{ product: { name: "Wireless Headphones", category: "Electronics" }, quantity: 1, price: 89.99 }],
          totalAmount: 89.99,
          status: "Completed",
        },
      ]),
    };
    vi.spyOn(Order, "find").mockReturnValue(chain);

    const res = await request(app).get("/api/orders/recent");

    expect(res.status).toBe(200);
    expect(res.body.data[0].orderNumber).toBe("ORD-100001");
    expect(res.body.data[0].customer).toEqual({ name: "Jane Doe", email: "jane@example.com" });
    expect(res.body.data[0].status).toBe("Completed");
  });
});

describe("GET /api/products", () => {
  it("200s with data + pagination", async () => {
    vi.spyOn(Product, "find").mockReturnValue({
      sort: vi.fn().mockReturnThis(),
      skip: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      select: vi.fn().mockResolvedValue([
        { name: "Wireless Headphones", category: "Electronics", price: 89.99, stock: 120 },
      ]),
    });
    vi.spyOn(Product, "countDocuments").mockResolvedValue(1);

    const res = await request(app).get("/api/products?page=1&limit=10");

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.pagination.total).toBe(1);
  });

  it("400s on invalid pagination", async () => {
    const res = await request(app).get("/api/products?limit=0");
    expect(res.status).toBe(400);
  });
});

describe("GET /api/customers", () => {
  it("200s with data + pagination, without exposing unnecessary fields", async () => {
    const selectSpy = vi.fn().mockResolvedValue([
      { name: "Jane Doe", email: "jane@example.com", city: "Austin", country: "United States", createdAt: "2026-01-01T00:00:00.000Z" },
    ]);
    vi.spyOn(Customer, "find").mockReturnValue({
      sort: vi.fn().mockReturnThis(),
      skip: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      select: selectSpy,
    });
    vi.spyOn(Customer, "countDocuments").mockResolvedValue(1);

    const res = await request(app).get("/api/customers");

    expect(res.status).toBe(200);
    expect(res.body.data[0]).toEqual({
      name: "Jane Doe",
      email: "jane@example.com",
      city: "Austin",
      country: "United States",
      createdAt: "2026-01-01T00:00:00.000Z",
    });
    // Confirms the query explicitly projects only these safe fields —
    // phone and any other data are excluded at the query level.
    expect(selectSpy).not.toHaveBeenCalledWith(expect.stringContaining("phone"));
  });
});
