const asyncHandler = require("../utils/asyncHandler");
const { success } = require("../utils/apiResponse");
const {
  parseDateRange,
  parseCategory,
  parseStatus,
  parseLimitParam,
} = require("../utils/queryHelpers");
const analyticsService = require("../services/analyticsService");

function parseCommonFilters(query) {
  const { startDate, endDate } = parseDateRange(query);
  const category = parseCategory(query);
  const status = parseStatus(query);
  return { startDate, endDate, category, status };
}

exports.getSummary = asyncHandler(async (req, res) => {
  const filters = parseCommonFilters(req.query);
  const data = await analyticsService.getSummary(filters);
  success(res, 200, data);
});

exports.getRevenue = asyncHandler(async (req, res) => {
  const filters = parseCommonFilters(req.query);
  const data = await analyticsService.getRevenueOverTime(filters);
  success(res, 200, data);
});

exports.getOrdersOverTime = asyncHandler(async (req, res) => {
  const filters = parseCommonFilters(req.query);
  const data = await analyticsService.getOrdersOverTime(filters);
  success(res, 200, data);
});

exports.getCategoryRevenue = asyncHandler(async (req, res) => {
  const filters = parseCommonFilters(req.query);
  const data = await analyticsService.getCategoryRevenue(filters);
  success(res, 200, data);
});

exports.getOrderStatusBreakdown = asyncHandler(async (req, res) => {
  const { startDate, endDate } = parseDateRange(req.query);
  const category = parseCategory(req.query);
  const data = await analyticsService.getOrderStatusBreakdown({ startDate, endDate, category });
  success(res, 200, data);
});

exports.getTopProducts = asyncHandler(async (req, res) => {
  const filters = parseCommonFilters(req.query);
  const limit = parseLimitParam(req.query, { defaultValue: 10, max: 50 });
  const data = await analyticsService.getTopProducts({ ...filters, limit });
  success(res, 200, data);
});
