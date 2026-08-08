const express = require("express");
const router = express.Router();

const {
    simulateTransactions,
} = require("../controllers/kafkaController");

router.post("/simulate", simulateTransactions);

module.exports = router;
//bin\windows\kafka-server-start.bat config\server.properties

//new cmd mein   netstat -ano | findstr ":9092"
/// new cmd mein  bin\windows\kafka-broker-api-versions.bat --bootstrap-server localhost:9092


