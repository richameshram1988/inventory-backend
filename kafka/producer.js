const { Kafka } = require("kafkajs");

const kafka = new Kafka({
  clientId: "inventory-app",

  brokers: [process.env.KAFKA_BROKER],

  ssl: true,

  sasl: {
    mechanism: "plain",
    username: process.env.KAFKA_USERNAME,
    password: process.env.KAFKA_PASSWORD,
  },
});

const producer = kafka.producer();

const connectProducer = async () => {
  await producer.connect();
  console.log("Kafka Producer Connected");
};

const sendInventoryEvent = async (event) => {
  await producer.send({
    topic: process.env.KAFKA_TOPIC || "inventory-events",
    messages: [
      {
        value: JSON.stringify(event),
      },
    ],
  });

  console.log("Event sent:", event);
};

module.exports = {
  connectProducer,
  sendInventoryEvent,
};