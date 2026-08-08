const { Kafka } = require("kafkajs");
const pool = require("../config/db");

const kafka = new Kafka({
    clientId: "inventory-consumer",
    brokers: ["127.0.0.1:9092"],
});

const consumer = kafka.consumer({
    groupId: "inventory-group",
});

const processSale = async (event) => {

    const client = await pool.connect();

    try {

        await client.query("BEGIN");

        const productId = event.product_id;
        const saleQty = Number(event.quantity);

        let remainingSaleQty = saleQty;
        let totalCost = 0;

        // 1. Check available stock
        const stockResult = await client.query(
            `
            SELECT COALESCE(SUM(remaining_quantity), 0) AS total_stock
            FROM purchase_batches
            WHERE product_id = $1
            `,
            [productId]
        );

        const totalStock = Number(stockResult.rows[0].total_stock);

        if (totalStock < saleQty) {
            throw new Error(
                `Insufficient stock. Available: ${totalStock}, Required: ${saleQty}`
            );
        }

        // 2. Get batches in FIFO order
        const batchesResult = await client.query(
            `
            SELECT *
            FROM purchase_batches
            WHERE product_id = $1
            AND remaining_quantity > 0
            ORDER BY purchase_date ASC, id ASC
            FOR UPDATE
            `,
            [productId]
        );

        // 3. Create sale record first
        const saleResult = await client.query(
            `
            INSERT INTO sales
            (
                product_id,
                quantity,
                total_cost
            )
            VALUES ($1, $2, $3)
            RETURNING *
            `,
            [
                productId,
                saleQty,
                0
            ]
        );

        const saleId = saleResult.rows[0].id;

        // 4. FIFO processing
        for (const batch of batchesResult.rows) {

            if (remainingSaleQty <= 0) {
                break;
            }

            const availableQty =
                Number(batch.remaining_quantity);

            const consumeQty = Math.min(
                remainingSaleQty,
                availableQty
            );

            const unitCost = Number(batch.unit_cost);

            const batchCost =
                consumeQty * unitCost;

            totalCost += batchCost;

            // Update batch stock
            await client.query(
                `
                UPDATE purchase_batches
                SET remaining_quantity =
                    remaining_quantity - $1
                WHERE id = $2
                `,
                [
                    consumeQty,
                    batch.id
                ]
            );

            // Save FIFO detail
            await client.query(
                `
                INSERT INTO sale_details
                (
                    sale_id,
                    batch_id,
                    quantity,
                    unit_cost
                )
                VALUES ($1, $2, $3, $4)
                `,
                [
                    saleId,
                    batch.id,
                    consumeQty,
                    unitCost
                ]
            );

            remainingSaleQty -= consumeQty;

            console.log(
                `FIFO Batch ${batch.id}: ${consumeQty} × ${unitCost}`
            );
        }

        // 5. Update total sale cost
        await client.query(
            `
            UPDATE sales
            SET total_cost = $1
            WHERE id = $2
            `,
            [
                totalCost,
                saleId
            ]
        );

        await client.query("COMMIT");

        console.log("================================");
        console.log("SALE COMPLETED");
        console.log("Sale ID:", saleId);
        console.log("Product ID:", productId);
        console.log("Quantity:", saleQty);
        console.log("FIFO Total Cost:", totalCost);
        console.log("================================");

    } catch (error) {

        await client.query("ROLLBACK");

        console.error("FIFO Sale Error:", error);

    } finally {

        client.release();
    }
};

const processPurchase = async (event) => {

    const client = await pool.connect();

    try {

        await client.query("BEGIN");

        const productId = event.product_id;
        const quantity = Number(event.quantity);
        const unitCost = Number(event.unit_cost);

        await client.query(
            `
            INSERT INTO purchase_batches
            (
                product_id,
                quantity,
                remaining_quantity,
                unit_cost
            )
            VALUES ($1, $2, $2, $3)
            `,
            [
                productId,
                quantity,
                unitCost
            ]
        );

        await client.query("COMMIT");

        console.log("================================");
        console.log("PURCHASE COMPLETED");
        console.log("Product ID:", productId);
        console.log("Quantity:", quantity);
        console.log("Unit Cost:", unitCost);
        console.log("================================");

    } catch (error) {

        await client.query("ROLLBACK");

        console.error(
            "Purchase Error:",
            error
        );

    } finally {

        client.release();

    }
};

const startConsumer = async () => {

    try {

        await consumer.connect();

        console.log("Kafka Consumer Connected");

        await consumer.subscribe({
            topic: "inventory-events",
            fromBeginning: false,
        });

        await consumer.run({

            eachMessage: async ({ message }) => {

                try {

                    const event =
                        JSON.parse(
                            message.value.toString()
                        );

                    console.log(
                        "Received Kafka Event:",
                        event
                    );

                    if (event.type === "SALE") {

                        await processSale(event);

                    }
                    if (event.type === "PURCHASE") {

                       await processPurchase(event);

                    }

                } catch (error) {

                    console.error(
                        "Event Processing Error:",
                        error
                    );

                }
            }

        });

    } catch (error) {

        console.error(
            "Kafka Consumer Error:",
            error
        );
    }
};

startConsumer();