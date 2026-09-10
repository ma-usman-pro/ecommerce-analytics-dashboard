const express = require("express");
const router = express.Router();
const controller = require("../controllers/customerController");

router.get("/", controller.getCustomers);

module.exports = router;
