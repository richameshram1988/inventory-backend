const express = require("express");

const cors = require("cors");

const app = express();
const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const purchaseRoutes = require("./routes/purchaseRoutes");
const saleRoutes = require("./routes/saleRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const kafkaRoutes = require("./routes/kafkaRoutes");
const protect = require("./middleware/protect");




app.use(cors());
app.use(express.json());

// app.get("/", (req, res) => {
//     res.send("Inventory API Running...");
// });

app.use("/api/auth", authRoutes);
app.use("/api/products",protect, productRoutes);
app.use("/api/purchases",protect, purchaseRoutes);
app.use("/api/sales",protect, saleRoutes);
app.use("/api/dashboard",protect, dashboardRoutes);
app.use("/api/kafka", protect,kafkaRoutes);



module.exports = app;