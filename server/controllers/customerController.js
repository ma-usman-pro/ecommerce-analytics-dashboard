const asyncHandler = require("../utils/asyncHandler");
const { parsePagination } = require("../utils/queryHelpers");
const customerService = require("../services/customerService");

exports.getCustomers = asyncHandler(async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query);
  const search = req.query.search ? String(req.query.search) : null;

  const { data, pagination } = await customerService.listCustomers({ search, page, limit, skip });
  res.status(200).json({ success: true, data, pagination });
});
