const Order = require("../models/Order");
const { buildDateMatch, buildStatusMatch } = require("../utils/queryHelpers");

async function listOrders({ startDate, endDate, category, status, search, page, limit, skip }) {
  const baseMatch = {
    ...buildDateMatch(startDate, endDate),
    ...buildStatusMatch(status),
  };

  const pipeline = [{ $match: baseMatch }];

  if (category) {
    pipeline.push(
      {
        $lookup: {
          from: "products",
          localField: "items.product",
          foreignField: "_id",
          as: "productDocs",
        },
      },
      { $match: { "productDocs.category": category } }
    );
  }

  pipeline.push(
    {
      $lookup: {
        from: "customers",
        localField: "customer",
        foreignField: "_id",
        as: "customerDoc",
      },
    },
    { $unwind: "$customerDoc" }
  );

  if (search) {
    const regex = new RegExp(search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    pipeline.push({
      $match: { $or: [{ orderNumber: regex }, { "customerDoc.name": regex }] },
    });
  }

  pipeline.push({
    $facet: {
      data: [
        { $sort: { createdAt: -1 } },
        { $skip: skip },
        { $limit: limit },
        {
          $project: {
            orderNumber: 1,
            customer: { name: "$customerDoc.name", email: "$customerDoc.email" },
            items: 1,
            subtotal: 1,
            discount: 1,
            tax: 1,
            totalAmount: 1,
            status: 1,
            paymentMethod: 1,
            createdAt: 1,
          },
        },
      ],
      totalCount: [{ $count: "count" }],
    },
  });

  const [result] = await Order.aggregate(pipeline);
  const data = result?.data || [];
  const total = result?.totalCount?.[0]?.count || 0;

  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages: total === 0 ? 0 : Math.ceil(total / limit),
    },
  };
}

async function getRecentOrders({ limit = 10 } = {}) {
  const orders = await Order.find({})
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate("customer", "name email city country")
    .populate("items.product", "name category")
    .lean();

  return orders.map((o) => ({
    orderNumber: o.orderNumber,
    customer: o.customer ? { name: o.customer.name, email: o.customer.email } : null,
    date: o.createdAt,
    items: o.items.map((it) => ({
      product: it.product ? it.product.name : null,
      category: it.product ? it.product.category : null,
      quantity: it.quantity,
      price: it.price,
    })),
    totalAmount: o.totalAmount,
    status: o.status,
  }));
}

module.exports = { listOrders, getRecentOrders };
