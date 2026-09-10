require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const Product = require("../models/Product");
const Customer = require("../models/Customer");
const Order = require("../models/Order");
const { buildProducts, buildCustomers, buildOrders } = require("./generate");

const CUSTOMER_COUNT = 100;
const ORDER_COUNT = 400; // within the requested 300-500 range
const ORDER_SPAN_DAYS = 270; // ~9 months, within the requested 6-12 month window

async function run() {
  await connectDB();

  console.log("[seed] Clearing existing demo data...");
  await Promise.all([
    Product.deleteMany({}),
    Customer.deleteMany({}),
    Order.deleteMany({}),
  ]);

  console.log("[seed] Inserting products...");
  const productSeeds = buildProducts();
  const insertedProducts = await Product.insertMany(
    productSeeds.map(({ salesTier, ...rest }) => rest)
  );
  // Recombine inserted docs (with real _id/price) with their sales tier,
  // preserving array order, for weighted order generation below.
  const productsWithTier = insertedProducts.map((doc, i) => ({
    doc,
    salesTier: productSeeds[i].salesTier,
  }));

  console.log("[seed] Inserting customers...");
  const customerSeeds = buildCustomers(CUSTOMER_COUNT);
  const insertedCustomers = await Customer.insertMany(
    customerSeeds.map(({ _activityWeight, ...rest }) => rest)
  );
  // Recombine with activity weight the same way, by index.
  const customersWithWeight = insertedCustomers.map((doc, i) => {
    doc._activityWeight = customerSeeds[i]._activityWeight;
    return doc;
  });

  console.log("[seed] Generating and inserting orders...");
  const orderSeeds = buildOrders({
    products: productsWithTier,
    customers: customersWithWeight,
    count: ORDER_COUNT,
    spanDays: ORDER_SPAN_DAYS,
  });
  const insertedOrders = await Order.insertMany(orderSeeds, { ordered: true });

  printSummary(insertedProducts, insertedCustomers, insertedOrders);

  await mongoose.disconnect();
  console.log("[seed] Done. Connection closed.");
}

function printSummary(products, customers, orders) {
  const dates = orders.map((o) => o.createdAt);
  const minDate = new Date(Math.min(...dates));
  const maxDate = new Date(Math.max(...dates));

  const statusCounts = {};
  const categoryRevenue = {};
  let totalRevenue = 0;

  const productById = new Map(products.map((p) => [String(p._id), p]));

  for (const order of orders) {
    statusCounts[order.status] = (statusCounts[order.status] || 0) + 1;
    totalRevenue += order.totalAmount;
    for (const item of order.items) {
      const product = productById.get(String(item.product));
      if (!product) continue;
      const key = product.category;
      categoryRevenue[key] = (categoryRevenue[key] || 0) + item.price * item.quantity;
    }
  }

  const ordersPerCustomer = new Map();
  for (const order of orders) {
    const key = String(order.customer);
    ordersPerCustomer.set(key, (ordersPerCustomer.get(key) || 0) + 1);
  }
  const returningCustomers = [...ordersPerCustomer.values()].filter((n) => n > 1).length;

  console.log("\n========== SEED SUMMARY ==========");
  console.log(`Products inserted:  ${products.length}`);
  console.log(`Customers inserted: ${customers.length}`);
  console.log(`Orders inserted:    ${orders.length}`);
  console.log(`Date range:         ${minDate.toDateString()} -> ${maxDate.toDateString()}`);
  console.log(`Total revenue:      $${totalRevenue.toFixed(2)}`);
  console.log(`Customers with 2+ orders: ${returningCustomers} / ${customers.length}`);
  console.log("\nOrder status breakdown:");
  Object.entries(statusCounts).forEach(([status, n]) => {
    console.log(`  ${status.padEnd(11)} ${n} (${((n / orders.length) * 100).toFixed(1)}%)`);
  });
  console.log("\nRevenue by category:");
  Object.entries(categoryRevenue)
    .sort((a, b) => b[1] - a[1])
    .forEach(([cat, rev]) => console.log(`  ${cat.padEnd(12)} $${rev.toFixed(2)}`));
  console.log("===================================\n");
}

run().catch((err) => {
  console.error("[seed] Failed:", err);
  process.exit(1);
});
