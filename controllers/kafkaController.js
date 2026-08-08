const {
  connectProducer,
  sendInventoryEvent
} = require("../kafka/producer");

const simulateTransactions = async (req, res) => {
  try {

    await connectProducer();

    const events = [];

    for (let i = 1; i <= 10; i++) {

      const event = {
        type: i % 2 === 0 ? "SALE" : "PURCHASE",
        product_id: 1,
        quantity: Math.floor(Math.random() * 10) + 2,
        timestamp: new Date().toISOString()
      };

      await sendInventoryEvent(event);

      events.push(event);
    }

    res.status(200).json({
      success: true,
      message: "10 dummy Kafka events sent successfully",
      count: events.length,
      events: events
    });

  } catch (error) {

    console.error("Kafka Simulator Error:", error);

    res.status(500).json({
      success: false,
      message: error.message
    });

  }
};

module.exports = {
  simulateTransactions
};