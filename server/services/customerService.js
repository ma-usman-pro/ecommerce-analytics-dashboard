const Customer = require("../models/Customer");

async function listCustomers({ search, page, limit, skip }) {
  const match = {};
  if (search) {
    const regex = new RegExp(search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    match.$or = [{ name: regex }, { email: regex }];
  }

  const [data, total] = await Promise.all([
    Customer.find(match).sort({ createdAt: -1 }).skip(skip).limit(limit).select("name email city country createdAt"),
    Customer.countDocuments(match),
  ]);

  return {
    data,
    pagination: { page, limit, total, totalPages: total === 0 ? 0 : Math.ceil(total / limit) },
  };
}

module.exports = { listCustomers };
