const Order = require("../models/Order");
const {
  ALL_STATUSES,
  buildDateMatch,
  buildRevenueStatusMatch,
  buildStatusMatch,
  categoryJoinStages,
  round2,
} = require("../utils/queryHelpers");

async function getSummary({ startDate, endDate, category, status }) {
  const baseMatch = {
    ...buildDateMatch(startDate, endDate),
    ...buildRevenueStatusMatch(status),
  };

  let pipeline;
  if (category) {
    // Category filter active: revenue can't come from order.totalAmount
    // (an order can span multiple categories), so we attribute revenue at
    // the item level, then collapse back to one row per order so order
    // counts and customer counts aren't inflated by multi-item orders.
    pipeline = [
      { $match: baseMatch },
      ...categoryJoinStages(category),
      {
        $group: {
          _id: "$_id",
          orderRevenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } },
          customer: { $first: "$customer" },
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$orderRevenue" },
          totalOrders: { $sum: 1 },
          customers: { $addToSet: "$customer" },
        },
      },
    ];
  } else {
    pipeline = [
      { $match: baseMatch },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$totalAmount" },
          totalOrders: { $sum: 1 },
          customers: { $addToSet: "$customer" },
        },
      },
    ];
  }

  const [result] = await Order.aggregate(pipeline);
  const totalRevenue = result ? round2(result.totalRevenue) : 0;
  const totalOrders = result ? result.totalOrders : 0;
  const totalCustomers = result ? result.customers.length : 0;
  const averageOrderValue = totalOrders > 0 ? round2(totalRevenue / totalOrders) : 0;

  return { totalRevenue, totalOrders, totalCustomers, averageOrderValue };
}

async function getRevenueOverTime({ startDate, endDate, category, status }) {
  const baseMatch = {
    ...buildDateMatch(startDate, endDate),
    ...buildRevenueStatusMatch(status),
  };

  const pipeline = category
    ? [
        { $match: baseMatch },
        ...categoryJoinStages(category),
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            revenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } },
          },
        },
      ]
    : [
        { $match: baseMatch },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            revenue: { $sum: "$totalAmount" },
          },
        },
      ];

  pipeline.push({ $sort: { _id: 1 } });

  const rows = await Order.aggregate(pipeline);
  return rows.map((r) => ({ date: r._id, revenue: round2(r.revenue) }));
}

async function getOrdersOverTime({ startDate, endDate, category, status }) {
  // Raw order counts, not revenue — every status is shown by default,
  // narrowed only if the caller explicitly asked for one.
  const baseMatch = {
    ...buildDateMatch(startDate, endDate),
    ...buildStatusMatch(status),
  };

  const pipeline = category
    ? [
        { $match: baseMatch },
        ...categoryJoinStages(category),
        {
          $group: {
            _id: {
              date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
              order: "$_id",
            },
          },
        },
        { $group: { _id: "$_id.date", orders: { $sum: 1 } } },
      ]
    : [
        { $match: baseMatch },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            orders: { $sum: 1 },
          },
        },
      ];

  pipeline.push({ $sort: { _id: 1 } });

  const rows = await Order.aggregate(pipeline);
  return rows.map((r) => ({ date: r._id, orders: r.orders }));
}

async function getCategoryRevenue({ startDate, endDate, category, status }) {
  const baseMatch = {
    ...buildDateMatch(startDate, endDate),
    ...buildRevenueStatusMatch(status),
  };

  const pipeline = [
    { $match: baseMatch },
    ...categoryJoinStages(category),
    {
      $group: {
        _id: "$productDoc.category",
        revenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } },
      },
    },
    { $sort: { revenue: -1 } },
  ];

  const rows = await Order.aggregate(pipeline);
  return rows.map((r) => ({ category: r._id, revenue: round2(r.revenue) }));
}

async function getOrderStatusBreakdown({ startDate, endDate, category }) {
  const dateMatch = buildDateMatch(startDate, endDate);

  const pipeline = category
    ? [
        { $match: dateMatch },
        ...categoryJoinStages(category),
        { $group: { _id: { status: "$status", order: "$_id" } } },
        { $group: { _id: "$_id.status", count: { $sum: 1 } } },
      ]
    : [
        { $match: dateMatch },
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ];

  const rows = await Order.aggregate(pipeline);

  // Fill every controlled status so the donut/legend is always complete,
  // even for statuses with zero matching orders in this filtered view.
  const counts = Object.fromEntries(ALL_STATUSES.map((s) => [s, 0]));
  rows.forEach((r) => { counts[r._id] = r.count; });

  return ALL_STATUSES.map((s) => ({ status: s, count: counts[s] }));
}

async function getTopProducts({ startDate, endDate, category, status, limit }) {
  const baseMatch = {
    ...buildDateMatch(startDate, endDate),
    ...buildRevenueStatusMatch(status),
  };

  const pipeline = [
    { $match: baseMatch },
    ...categoryJoinStages(category),
    {
      $group: {
        _id: "$items.product",
        name: { $first: "$productDoc.name" },
        category: { $first: "$productDoc.category" },
        unitsSold: { $sum: "$items.quantity" },
        orders: { $addToSet: "$_id" },
        revenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } },
      },
    },
    {
      $project: {
        _id: 0,
        product: "$name",
        category: 1,
        unitsSold: 1,
        orders: { $size: "$orders" },
        revenue: 1,
      },
    },
    { $sort: { revenue: -1 } },
    { $limit: limit },
  ];

  const rows = await Order.aggregate(pipeline);
  return rows.map((r) => ({ ...r, revenue: round2(r.revenue) }));
}

module.exports = {
  getSummary,
  getRevenueOverTime,
  getOrdersOverTime,
  getCategoryRevenue,
  getOrderStatusBreakdown,
  getTopProducts,
};
