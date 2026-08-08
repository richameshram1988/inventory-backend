const {
    connectProducer,
    sendInventoryEvent
} = require("./producer");

const test = async () => {

    await connectProducer();

    const event = {
        type: "SALE",
        product_id: 1,
        quantity: 10,
        timestamp: new Date().toISOString()
    };

    await sendInventoryEvent(event);

    process.exit(0);
};

test();