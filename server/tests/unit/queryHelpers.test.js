import { describe, it, expect } from "vitest";

// No mocking needed here: ORDER_STATUSES is a static array read directly
// off the real Order model, which doesn't touch the database just by
// being required (Mongoose only connects when config/db.js calls
// mongoose.connect() elsewhere) — safe to use as-is per the DB-isolation
// rule in this part's spec.

const {
  parseDateRange,
  parseCategory,
  parseStatus,
  parsePagination,
  parseLimitParam,
  buildDateMatch,
  buildRevenueStatusMatch,
  buildStatusMatch,
  round2,
} = require("../../utils/queryHelpers");

describe("parseDateRange", () => {
  it("returns nulls when neither date is provided", () => {
    expect(parseDateRange({})).toEqual({ startDate: null, endDate: null });
  });

  it("throws when only startDate is provided", () => {
    expect(() => parseDateRange({ startDate: "2026-01-01" })).toThrow(
      "Both startDate and endDate must be provided together"
    );
  });

  it("throws when only endDate is provided", () => {
    expect(() => parseDateRange({ endDate: "2026-01-01" })).toThrow(
      "Both startDate and endDate must be provided together"
    );
  });

  it("throws on invalid date format", () => {
    expect(() => parseDateRange({ startDate: "not-a-date", endDate: "2026-01-31" })).toThrow(
      /Invalid date format/
    );
  });

  it("throws when startDate is after endDate", () => {
    expect(() => parseDateRange({ startDate: "2026-03-01", endDate: "2026-01-01" })).toThrow(
      "startDate cannot be after endDate"
    );
  });

  it("accepts a valid range and normalizes to start/end of day UTC", () => {
    const { startDate, endDate } = parseDateRange({ startDate: "2026-01-01", endDate: "2026-01-31" });
    expect(startDate.toISOString()).toBe("2026-01-01T00:00:00.000Z");
    expect(endDate.toISOString()).toBe("2026-01-31T23:59:59.999Z");
  });

  it("accepts a single-day range (start === end)", () => {
    const { startDate, endDate } = parseDateRange({ startDate: "2026-06-01", endDate: "2026-06-01" });
    expect(startDate <= endDate).toBe(true);
  });
});

describe("parseCategory", () => {
  it("returns null when category is missing", () => {
    expect(parseCategory({})).toBeNull();
  });

  it('treats "All" (any casing) as no filter', () => {
    expect(parseCategory({ category: "All" })).toBeNull();
    expect(parseCategory({ category: "all" })).toBeNull();
    expect(parseCategory({ category: "ALL" })).toBeNull();
  });

  it("passes through a real category unchanged", () => {
    expect(parseCategory({ category: "Electronics" })).toBe("Electronics");
  });

  it("trims whitespace", () => {
    expect(parseCategory({ category: "  Electronics  " })).toBe("Electronics");
  });
});

describe("parseStatus", () => {
  it("returns null when status is missing or All", () => {
    expect(parseStatus({})).toBeNull();
    expect(parseStatus({ status: "all" })).toBeNull();
  });

  it("accepts a valid controlled status", () => {
    expect(parseStatus({ status: "Completed" })).toBe("Completed");
  });

  it("rejects an invalid status", () => {
    expect(() => parseStatus({ status: "Shipped" })).toThrow(/Invalid status/);
  });
});

describe("parsePagination", () => {
  it("defaults to page 1, limit 10", () => {
    expect(parsePagination({})).toEqual({ page: 1, limit: 10, skip: 0 });
  });

  it("computes skip correctly for page > 1", () => {
    expect(parsePagination({ page: "3", limit: "20" })).toEqual({ page: 3, limit: 20, skip: 40 });
  });

  it("rejects page < 1", () => {
    expect(() => parsePagination({ page: "0" })).toThrow(/page must be a positive integer/);
  });

  it("rejects a non-integer page", () => {
    expect(() => parsePagination({ page: "1.5" })).toThrow(/page must be a positive integer/);
  });

  it("rejects limit outside 1-100", () => {
    expect(() => parsePagination({ limit: "0" })).toThrow(/limit must be an integer between 1 and 100/);
    expect(() => parsePagination({ limit: "101" })).toThrow(/limit must be an integer between 1 and 100/);
  });
});

describe("parseLimitParam", () => {
  it("returns the default when no limit is given", () => {
    expect(parseLimitParam({}, { defaultValue: 5, max: 50 })).toBe(5);
  });

  it("accepts a valid limit within range", () => {
    expect(parseLimitParam({ limit: "20" }, { defaultValue: 5, max: 50 })).toBe(20);
  });

  it("rejects a limit above max (e.g. top-products limit=999)", () => {
    expect(() => parseLimitParam({ limit: "999" }, { defaultValue: 5, max: 50 })).toThrow(/Invalid limit/);
  });

  it("rejects a non-numeric limit", () => {
    expect(() => parseLimitParam({ limit: "abc" }, { defaultValue: 5, max: 50 })).toThrow(/Invalid limit/);
  });
});

describe("buildDateMatch", () => {
  it("returns an empty match when no dates given", () => {
    expect(buildDateMatch(null, null)).toEqual({});
  });

  it("builds a $gte/$lte range when both dates given", () => {
    const start = new Date("2026-01-01T00:00:00.000Z");
    const end = new Date("2026-01-31T23:59:59.999Z");
    expect(buildDateMatch(start, end)).toEqual({ createdAt: { $gte: start, $lte: end } });
  });
});

describe("buildRevenueStatusMatch / buildStatusMatch", () => {
  it("revenue match defaults to Completed/Processing/Pending when no explicit status", () => {
    expect(buildRevenueStatusMatch(null)).toEqual({
      status: { $in: ["Completed", "Processing", "Pending"] },
    });
  });

  it("revenue match uses the explicit status when provided, even Cancelled/Refunded", () => {
    expect(buildRevenueStatusMatch("Cancelled")).toEqual({ status: "Cancelled" });
  });

  it("plain status match is empty (all statuses) when nothing explicit", () => {
    expect(buildStatusMatch(null)).toEqual({});
  });

  it("plain status match narrows to the explicit status", () => {
    expect(buildStatusMatch("Pending")).toEqual({ status: "Pending" });
  });
});

describe("round2", () => {
  it("rounds to 2 decimal places", () => {
    expect(round2(19.005)).toBe(19.01);
    expect(round2(19.994)).toBe(19.99);
    expect(round2(100)).toBe(100);
  });
});
