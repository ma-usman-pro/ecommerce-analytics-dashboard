const mongoose = require("mongoose");

const CATEGORIES = [
  "Electronics",
  "Clothing",
  "Home",
  "Beauty",
  "Sports",
  "Accessories",
];

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      enum: {
        values: CATEGORIES,
        message: "{VALUE} is not a supported category",
      },
    },
    stock: {
      type: Number,
      required: [true, "Stock is required"],
      min: [0, "Stock cannot be negative"],
    },
    image: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

productSchema.index({ category: 1 });

productSchema.statics.CATEGORIES = CATEGORIES;

module.exports = mongoose.model("Product", productSchema);
