const asyncHandler = require("../utils/asyncHandler");
const { success } = require("../utils/apiResponse");
const {
  parseDateRange,
  parseCategory,
  parseStatus,
  parsePagination,
} = require("../utils/queryHelpers");
const orderService = require("../services/orderService");

exports.getOrders = asyncHandler(async (req, res) => {
  const { startDate, endDate } = parseDateRange(req.query);
  const category = parseCategory(req.query);
  const status = parseStatus(req.query);
  const { page, limit, skip } = parsePagination(req.query);
  const search = req.query.search ? String(req.query.search) : null;

  const { data, pagination } = await orderService.listOrders({
    startDate,
    endDate,
    category,
    status,
    search,
    page,
    limit,
    skip,
  });

  res.status(200).json({ success: true, data, pagination });
});

exports.getRecentOrders = asyncHandler(async (req, res) => {
  const raw = req.query.limit ? Number(req.query.limit) : 10;
  const limit = Number.isInteger(raw) && raw > 0 && raw <= 50 ? raw : 10;
  const data = await orderService.getRecentOrders({ limit });
  success(res, 200, data);
});
