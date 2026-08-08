const pool = require("../config/db");

// Add Purchase

exports.addPurchase = async (req, res) => {

    try {

        const {
            product_id,
            quantity,
            unit_cost
        } = req.body;

        const result = await pool.query(

            `INSERT INTO purchase_batches
            (
                product_id,
                quantity,
                remaining_quantity,
                unit_cost
            )

            VALUES($1,$2,$3,$4)

            RETURNING *`,

            [
                product_id,
                quantity,
                quantity,
                unit_cost
            ]

        );

        res.status(201).json(result.rows[0]);

    } catch (error) {

        console.log(error);

        res.status(500).json({
            message: error.message
        });

    }

};

// Get Purchases

exports.getPurchases = async (req, res) => {

    const result = await pool.query(

        `SELECT
            pb.*,
            p.name
        FROM purchase_batches pb
        JOIN products p
        ON pb.product_id = p.id
        ORDER BY pb.id DESC`

    );

    res.json(result.rows);

};