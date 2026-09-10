const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const mongoose = require("mongoose");
const notFound = require("./middleware/notFound");
const errorHandler = require("./middleware/errorHandler");

const analyticsRoutes = require("./routes/analyticsRoutes");
const orderRoutes = require("./routes/orderRoutes");
const productRoutes = require("./routes/productRoutes");
const customerRoutes = require("./routes/customerRoutes");
const categoryRoutes = require("./routes/categoryRoutes");

const app = express();

app.use(helmet());

// CORS: in development, allow the local Vite dev/preview servers so the
// dashboard works out of the box. In production, only the configured
// CLIENT_URL is allowed — never a wildcard. If CLIENT_URL isn't set in
// production, cross-origin requests are rejected (fail closed) rather
// than silently allowing everything.
const isProduction = process.env.NODE_ENV === "production";
const allowedOrigins = isProduction
  ? [process.env.CLIENT_URL].filter(Boolean)
  : [process.env.CLIENT_URL, "http://localhost:5173", "http://localhost:4173"].filter(Boolean);

if (isProduction && allowedOrigins.length === 0) {
  console.warn(
    "[cors] NODE_ENV=production but CLIENT_URL is not set — cross-origin requests will be rejected."
  );
}

app.use(
  cors({
    origin(origin, callback) {
      // Allow non-browser requests (no Origin header, e.g. curl/health checks).
      if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
      callback(new Error("Not allowed by CORS"));
    },
  })
);

// Generous general-purpose rate limit — enough headroom for normal
// dashboard use (repeated filter changes, chart refetches) while still
// blocking basic abuse. Only applied to the API, not static assets.
app.use(
  "/api",
  rateLimit({
    windowMs: 5 * 60 * 1000,
    max: 600,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: "Too many requests. Please try again shortly." },
  })
);

app.use(express.json());

app.get("/api/health", (req, res) => {
  const dbState = mongoose.connection.readyState; // 1 = connected
  res.json({
    success: true,
    status: "ok",
    database: dbState === 1 ? "connected" : "disconnected",
    timestamp: new Date().toISOString(),
  });
});

app.use("/api/analytics", analyticsRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/products", productRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/categories", categoryRoutes);

// Dashboard UI routes are added in later parts of this project.

app.use(notFound);
app.use(errorHandler);

module.exports = app;
