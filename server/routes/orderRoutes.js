const express = require("express");
const router = express.Router();
const controller = require("../controllers/orderController");

// NOTE: /recent must be registered before the plain "/" collection route
// is mounted at a different prefix in server.js, so there's no /: id
// ambiguity here — both routes live directly on this router.
router.get("/recent", controller.getRecentOrders);
router.get("/", controller.getOrders);

module.exports = router;
