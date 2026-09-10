const Product = require("../models/Product");

async function listCategories() {
  const categories = await Product.distinct("category");
  return categories.sort();
}

module.exports = { listCategories };
