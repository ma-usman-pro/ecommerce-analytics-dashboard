const asyncHandler = require("../utils/asyncHandler");
const { parseCategory, parsePagination } = require("../utils/queryHelpers");
const productService = require("../services/productService");

exports.getProducts = asyncHandler(async (req, res) => {
  const category = parseCategory(req.query);
  const { page, limit, skip } = parsePagination(req.query);
  const search = req.query.search ? String(req.query.search) : null;

  const { data, pagination } = await productService.listProducts({ search, category, page, limit, skip });
  res.status(200).json({ success: true, data, pagination });
});
