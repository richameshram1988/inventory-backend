const { Kafka } = require("kafkajs");

const kafka = new Kafka({
    clientId: "inventory-app",
    brokers: ["127.0.0.1:9092"],
});

const producer = kafka.producer();

const connectProducer = async () => {
    await producer.connect();
    console.log("Kafka Producer Connected");
};

const sendInventoryEvent = async (event) => {
    await producer.send({
        topic: "inventory-events",
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