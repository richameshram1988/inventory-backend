const express = require("express");
const router = express.Router();

const {
    addPurchase,
    getPurchases
} = require("../controllers/purchaseController");

router.post("/", addPurchase);
router.get("/", getPurchases);

module.exports = router;