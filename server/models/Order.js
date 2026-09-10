const mongoose = require("mongoose");

const ORDER_STATUSES = [
  "Completed",
  "Processing",
  "Pending",
  "Cancelled",
  "Refunded",
];

const PAYMENT_METHODS = [
  "Credit Card",
  "Debit Card",
  "PayPal",
  "Bank Transfer",
  "Cash on Delivery",
];

// One line item within an order. `price` is a snapshot of the product's
// price at the time of purchase — it must never be derived from the
// product's current price, so historical orders stay accurate even if
// the product's price changes later.
const orderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: [true, "Order item must reference a product"],
    },
    quantity: {
      type: Number,
      required: [true, "Quantity is required"],
      min: [1, "Quantity must be at least 1"],
    },
    price: {
      type: Number,
      required: [true, "Item price is required"],
      min: [0, "Item price cannot be negative"],
    },
  },
  { _id: false }
);

const shippingAddressSchema = new mongoose.Schema(
  {
    address: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    state: { type: String, trim: true, default: "" },
    postalCode: { type: String, required: true, trim: true },
    country: { type: String, required: true, trim: true },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: [true, "Order must reference a customer"],
    },
    items: {
      type: [orderItemSchema],
      required: true,
      validate: {
        validator: (arr) => Array.isArray(arr) && arr.length > 0,
        message: "Order must contain at least one item",
      },
    },
    subtotal: {
      type: Number,
      required: true,
      min: [0, "Subtotal cannot be negative"],
    },
    discount: {
      type: Number,
      required: true,
      min: [0, "Discount cannot be negative"],
      default: 0,
    },
    tax: {
      type: Number,
      required: true,
      min: [0, "Tax cannot be negative"],
      default: 0,
    },
    totalAmount: {
      type: Number,
      required: true,
      min: [0, "Total amount cannot be negative"],
    },
    status: {
      type: String,
      required: true,
      enum: {
        values: ORDER_STATUSES,
        message: "{VALUE} is not a valid order status",
      },
      default: "Pending",
    },
    paymentMethod: {
      type: String,
      required: true,
      enum: {
        values: PAYMENT_METHODS,
        message: "{VALUE} is not a supported payment method",
      },
    },
    shippingAddress: {
      type: shippingAddressSchema,
      required: true,
    },
  },
  { timestamps: true }
);

// Analytics / filtering indexes
orderSchema.index({ createdAt: -1 });
orderSchema.index({ status: 1 });
orderSchema.index({ customer: 1 });

orderSchema.statics.ORDER_STATUSES = ORDER_STATUSES;
orderSchema.statics.PAYMENT_METHODS = PAYMENT_METHODS;

module.exports = mongoose.model("Order", orderSchema);
