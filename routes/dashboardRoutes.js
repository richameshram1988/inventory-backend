const express = require("express");
const router = express.Router();

const {
    stockOverview,
    transactionLedger
} = require("../controllers/dashboardController");

router.get("/stock-overview", stockOverview);
router.get("/transaction-ledger", transactionLedger);

module.exports = router;