const {
    connectProducer,
    sendInventoryEvent
} = require("./producer");

const generateRandomTransaction = () => {

    const isSale = Math.random() > 0.5;

    if (isSale) {

        return {
            type: "SALE",
            product_id: 1,
            quantity: Math.floor(Math.random() * 5) + 1,
            timestamp: new Date().toISOString()
        };

    }

    return {
        type: "PURCHASE",
        product_id: 1,
        quantity: Math.floor(Math.random() * 10) + 5,
        unit_cost: Math.floor(Math.random() * 30) + 50,
        timestamp: new Date().toISOString()
    };
};


const simulate = async () => {

    try {

        await connectProducer();

        for (let i = 1; i <= 10; i++) {

            const event =
                generateRandomTransaction();

            await sendInventoryEvent(event);

            console.log(
                `Transaction ${i}/10 sent`
            );

            // 1 second delay
            await new Promise(
                resolve => setTimeout(resolve, 1000)
            );
        }

        console.log(
            "10 transactions completed"
        );

        process.exit(0);

    } catch (error) {

        console.error(
            "Simulator Error:",
            error
        );

        process.exit(1);
    }
};

simulate();