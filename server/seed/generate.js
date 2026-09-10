const { CATALOG } = require("./catalog");
const {
  FIRST_NAMES,
  LAST_NAMES,
  CITY_COUNTRY_PAIRS,
  EMAIL_DOMAINS,
  STREET_NAMES,
} = require("./locations");

const ORDER_STATUSES = ["Completed", "Processing", "Pending", "Cancelled", "Refunded"];
const PAYMENT_METHODS = ["Credit Card", "Debit Card", "PayPal", "Bank Transfer", "Cash on Delivery"];

const TIER_WEIGHT = { high: 6, medium: 3, low: 1 };
const STATUS_WEIGHT = { Completed: 68, Processing: 12, Pending: 8, Cancelled: 8, Refunded: 4 };
const PAYMENT_WEIGHT = { "Credit Card": 40, "Debit Card": 25, PayPal: 20, "Bank Transfer": 10, "Cash on Delivery": 5 };
const ITEM_COUNT_WEIGHT = { 1: 35, 2: 30, 3: 20, 4: 10, 5: 5 };
const QUANTITY_WEIGHT = { 1: 60, 2: 25, 3: 10, 4: 5 };

function round2(n) {
  return Math.round(n * 100) / 100;
}

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick(arr) {
  return arr[randInt(0, arr.length - 1)];
}

/** Weighted pick over a list of [value, weight] pairs, or an object map. */
function weightedPick(weightMap) {
  const entries = Array.isArray(weightMap) ? weightMap : Object.entries(weightMap);
  const total = entries.reduce((sum, [, w]) => sum + w, 0);
  let r = Math.random() * total;
  for (const [value, w] of entries) {
    r -= w;
    if (r <= 0) return value;
  }
  return entries[entries.length - 1][0];
}

function slugify(str) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

/* ------------------------------------------------------------------ */
/* Products                                                            */
/* ------------------------------------------------------------------ */
function buildProducts() {
  return CATALOG.map((item) => ({
    name: item.name,
    description: item.description,
    price: item.price,
    category: item.category,
    stock: item.stock,
    image: `https://picsum.photos/seed/${slugify(item.name)}/480/480`,
    salesTier: item.tier, // stripped out before insert; used only for order weighting
  }));
}

/* ------------------------------------------------------------------ */
/* Customers                                                           */
/* ------------------------------------------------------------------ */
function buildCustomers(count = 100) {
  const customers = [];
  const usedEmails = new Set();

  for (let i = 0; i < count; i++) {
    const first = pick(FIRST_NAMES);
    const last = pick(LAST_NAMES);
    const location = pick(CITY_COUNTRY_PAIRS);

    let email;
    let attempt = 0;
    do {
      const domain = pick(EMAIL_DOMAINS);
      const suffix = attempt === 0 ? "" : String(randInt(1, 999));
      email = `${first.toLowerCase()}.${last.toLowerCase().replace(/[^a-z]/g, "")}${suffix}@${domain}`;
      attempt++;
    } while (usedEmails.has(email));
    usedEmails.add(email);

    // ~15% of customers have no phone on file
    const phone = Math.random() < 0.15 ? "" : `+1-${randInt(200, 999)}-${randInt(200, 999)}-${randInt(1000, 9999)}`;

    // Activity weight controls how often this customer gets picked for an
    // order later — skewed so most customers are occasional buyers and a
    // smaller group are frequent/returning customers.
    const activityWeight = round2(Math.pow(Math.random(), 1.6) * 4 + 1);

    customers.push({
      name: `${first} ${last}`,
      email,
      phone,
      city: location.city,
      country: location.country,
      _activityWeight: activityWeight, // stripped before insert
    });
  }

  return customers;
}

/* ------------------------------------------------------------------ */
/* Orders                                                              */
/* ------------------------------------------------------------------ */

// Builds a weighted day-offset distribution across the last `spanDays`,
// with a mild weekday/weekend skew and a smooth seasonal wave so volume
// isn't flat across the period.
function buildDayWeights(spanDays) {
  const weights = [];
  for (let offset = 0; offset < spanDays; offset++) {
    const d = new Date();
    d.setDate(d.getDate() - offset);
    const isWeekend = d.getDay() === 0 || d.getDay() === 6;
    const weekdayFactor = isWeekend ? 0.82 : 1.0;
    const seasonalFactor = 1 + 0.25 * Math.sin((offset / spanDays) * Math.PI * 2);
    weights.push([offset, Math.max(0.1, weekdayFactor * seasonalFactor)]);
  }
  return weights;
}

function buildOrders({ products, customers, count = 400, spanDays = 270 }) {
  const dayWeights = buildDayWeights(spanDays);

  // products: array of { doc: <inserted Mongoose doc>, salesTier }
  const productWeights = products.map((p) => [p, TIER_WEIGHT[p.salesTier]]);
  const customerWeights = customers.map((c) => [c, c._activityWeight || 1]);

  const orders = [];

  for (let i = 0; i < count; i++) {
    const customer = weightedPick(customerWeights);

    const dayOffset = Number(weightedPick(dayWeights));
    const orderDate = new Date();
    orderDate.setDate(orderDate.getDate() - dayOffset);
    orderDate.setHours(randInt(7, 22), randInt(0, 59), randInt(0, 59), 0);

    const itemCount = Number(weightedPick(ITEM_COUNT_WEIGHT));
    const chosenProductIds = new Set();
    const items = [];

    while (items.length < itemCount) {
      const productEntry = weightedPick(productWeights);
      const productId = String(productEntry.doc._id);
      if (chosenProductIds.has(productId)) continue; // avoid duplicate line items
      chosenProductIds.add(productId);

      const quantity = Number(weightedPick(QUANTITY_WEIGHT));
      items.push({
        product: productEntry.doc._id,
        quantity,
        price: productEntry.doc.price, // snapshot at time of purchase
      });
    }

    const subtotal = round2(items.reduce((sum, it) => sum + it.price * it.quantity, 0));

    // ~25% of orders have a discount code applied (5-20% off subtotal)
    const discount = Math.random() < 0.25 ? round2(subtotal * (randInt(5, 20) / 100)) : 0;

    const taxable = Math.max(0, subtotal - discount);
    const tax = round2(taxable * 0.075); // flat 7.5% sales tax for the dataset

    const totalAmount = round2(subtotal - discount + tax);

    const status = weightedPick(STATUS_WEIGHT);
    const paymentMethod = weightedPick(PAYMENT_WEIGHT);

    const street = `${randInt(100, 9999)} ${pick(STREET_NAMES)}`;
    const shippingAddress = {
      address: street,
      city: customer.city,
      state: "",
      postalCode: String(randInt(10000, 99999)),
      country: customer.country,
    };

    orders.push({
      orderNumber: `ORD-${String(100000 + i)}`,
      customer: customer._id,
      items,
      subtotal,
      discount,
      tax,
      totalAmount,
      status,
      paymentMethod,
      shippingAddress,
      createdAt: orderDate,
      updatedAt: orderDate,
    });
  }

  return orders;
}

module.exports = {
  buildProducts,
  buildCustomers,
  buildOrders,
  round2,
};
