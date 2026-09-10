const Product = require("../models/Product");

async function listProducts({ search, category, page, limit, skip }) {
  const match = {};
  if (category) match.category = category;
  if (search) match.name = new RegExp(search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");

  const [data, total] = await Promise.all([
    Product.find(match).sort({ name: 1 }).skip(skip).limit(limit).select("name category price stock image"),
    Product.countDocuments(match),
  ]);

  return {
    data,
    pagination: { page, limit, total, totalPages: total === 0 ? 0 : Math.ceil(total / limit) },
  };
}

module.exports = { listProducts };
