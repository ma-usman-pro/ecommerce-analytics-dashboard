const express = require("express");
const router = express.Router();
const controller = require("../controllers/analyticsController");

router.get("/summary", controller.getSummary);
router.get("/revenue", controller.getRevenue);
router.get("/orders", controller.getOrdersOverTime);
router.get("/categories", controller.getCategoryRevenue);
router.get("/order-status", controller.getOrderStatusBreakdown);
router.get("/top-products", controller.getTopProducts);

module.exports = router;
