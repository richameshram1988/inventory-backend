const { Kafka } = require("kafkajs");

const kafka = new Kafka({
    clientId: "inventory-app",
    brokers: ["localhost:9092"],
});

const admin = kafka.admin();

async function setupKafka() {
    try {
        await admin.connect();

        console.log("Kafka Admin Connected");

        const result = await admin.createTopics({
            waitForLeaders: true,
            topics: [
                {
                    topic: "inventory-events",
                    numPartitions: 1,
                    replicationFactor: 1,
                },
            ],
        });

        console.log("Topic creation result:", result);

        await admin.disconnect();

    } catch (error) {
        console.error("Kafka Error:", error);
    }
}

setupKafka();