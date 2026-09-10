const asyncHandler = require("../utils/asyncHandler");
const { success } = require("../utils/apiResponse");
const categoryService = require("../services/categoryService");

exports.getCategories = asyncHandler(async (req, res) => {
  const data = await categoryService.listCategories();
  success(res, 200, data);
});
