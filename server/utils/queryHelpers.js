const AppError = require("./AppError");
const Order = require("../models/Order");

// Business rule (documented in Part 3 report): Completed, Processing, and
// Pending orders count toward revenue. Cancelled and Refunded do not.
// Any endpoint that reports revenue defaults to this set unless the caller
// explicitly passes a `status` query param, in which case that explicit
// choice always wins — including Cancelled/Refunded, if that's what was
// asked for.
const REVENUE_STATUSES = ["Completed", "Processing", "Pending"];
const ALL_STATUSES = Order.ORDER_STATUSES;

const DATE_ONLY_RE = /^\d{4}-\d{2}-\d{2}$/;

function parseDateParam(value, { endOfDay = false } = {}) {
  if (DATE_ONLY_RE.test(value)) {
    const d = new Date(`${value}T00:00:00.000Z`);
    if (endOfDay) d.setUTCHours(23, 59, 59, 999);
    return d;
  }
  return new Date(value);
}

/**
 * Reads startDate/endDate from a query object. Both must be provided
 * together (a lone start or end is treated as an incomplete range) and
 * must parse to valid dates with start <= end. If neither is provided,
 * returns nulls, meaning "no date filter — use the full dataset."
 */
function parseDateRange(query) {
  const { startDate, endDate } = query;

  if (!startDate && !endDate) return { startDate: null, endDate: null };

  if (!startDate || !endDate) {
    throw new AppError("Both startDate and endDate must be provided together", 400);
  }

  const start = parseDateParam(startDate);
  const end = parseDateParam(endDate, { endOfDay: true });

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    throw new AppError("Invalid date format. Use YYYY-MM-DD.", 400);
  }
  if (start > end) {
    throw new AppError("startDate cannot be after endDate", 400);
  }

  return { startDate: start, endDate: end };
}

/**
 * `category=All`, `category=all`, or no category param at all means
 * "no category filter." Anything else is passed through as-is — we
 * deliberately don't validate against a hardcoded category list, since
 * that list should come from the database (see /api/categories) and a
 * hardcoded copy here could drift from it and reject legitimate values.
 */
function parseCategory(query) {
  const { category } = query;
  if (!category || String(category).trim().toLowerCase() === "all") return null;
  return String(category).trim();
}

/**
 * `status=All`/`status=all`/missing means "no status filter." Any other
 * value must match one of the model's controlled status values.
 */
function parseStatus(query) {
  const { status } = query;
  if (!status || String(status).trim().toLowerCase() === "all") return null;
  const normalized = String(status).trim();
  if (!ALL_STATUSES.includes(normalized)) {
    throw new AppError(
      `Invalid status "${normalized}". Must be one of: ${ALL_STATUSES.join(", ")}, or All`,
      400
    );
  }
  return normalized;
}

function parsePagination(query) {
  const page = query.page !== undefined ? Number(query.page) : 1;
  const limit = query.limit !== undefined ? Number(query.limit) : 10;

  if (!Number.isInteger(page) || page < 1) {
    throw new AppError("Invalid pagination parameter: page must be a positive integer", 400);
  }
  if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
    throw new AppError("Invalid pagination parameter: limit must be an integer between 1 and 100", 400);
  }

  return { page, limit, skip: (page - 1) * limit };
}

function parseLimitParam(query, { defaultValue = 10, max = 50 } = {}) {
  if (query.limit === undefined) return defaultValue;
  const limit = Number(query.limit);
  if (!Number.isInteger(limit) || limit < 1 || limit > max) {
    throw new AppError(`Invalid limit. Must be an integer between 1 and ${max}`, 400);
  }
  return limit;
}

function buildDateMatch(startDate, endDate) {
  if (!startDate || !endDate) return {};
  return { createdAt: { $gte: startDate, $lte: endDate } };
}

// Revenue-bearing endpoints: default to Completed/Processing/Pending
// unless a specific status was explicitly requested.
function buildRevenueStatusMatch(explicitStatus) {
  return explicitStatus ? { status: explicitStatus } : { status: { $in: REVENUE_STATUSES } };
}

// Plain order-count endpoints: show every status unless filtered.
function buildStatusMatch(explicitStatus) {
  return explicitStatus ? { status: explicitStatus } : {};
}

/**
 * Reusable aggregation segment: unwind order items, join each item's
 * product to read its category, and optionally restrict to one category.
 * Every category-aware analytic shares this so "revenue by category"
 * always means the same thing everywhere.
 */
function categoryJoinStages(category) {
  const stages = [
    { $unwind: "$items" },
    {
      $lookup: {
        from: "products",
        localField: "items.product",
        foreignField: "_id",
        as: "productDoc",
      },
    },
    { $unwind: "$productDoc" },
  ];
  if (category) {
    stages.push({ $match: { "productDoc.category": category } });
  }
  return stages;
}

function round2(n) {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

module.exports = {
  REVENUE_STATUSES,
  ALL_STATUSES,
  parseDateRange,
  parseCategory,
  parseStatus,
  parsePagination,
  parseLimitParam,
  buildDateMatch,
  buildRevenueStatusMatch,
  buildStatusMatch,
  categoryJoinStages,
  round2,
};
