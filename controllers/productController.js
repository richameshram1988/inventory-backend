const pool = require("../config/db");

// Add Product
exports.createProduct = async (req, res) => {
    try {
        const { name, sku } = req.body;

        const result = await pool.query(
            `INSERT INTO products(name, sku)
             VALUES($1,$2)
             RETURNING *`,
            [name, sku]
        );

        res.status(201).json(result.rows[0]);

    } catch (err) {
        console.log(err);
        res.status(500).json({ message: err.message });
    }
};

// Get All Products
exports.getProducts = async (req, res) => {

    const result = await pool.query(
        "SELECT * FROM products ORDER BY id DESC"
    );

    res.json(result.rows);
};

// Get Single Product
exports.getProduct = async (req, res) => {

    const result = await pool.query(
        "SELECT * FROM products WHERE id=$1",
        [req.params.id]
    );

    if (result.rows.length == 0) {
        return res.status(404).json({
            message: "Product Not Found"
        });
    }

    res.json(result.rows[0]);
};

// Update Product
exports.updateProduct = async (req, res) => {

    const { name, sku } = req.body;

    const result = await pool.query(
        `UPDATE products
         SET name=$1,
             sku=$2
         WHERE id=$3
         RETURNING *`,
        [name, sku, req.params.id]
    );

    res.json(result.rows[0]);
};

// Delete Product
exports.deleteProduct = async (req, res) => {

    await pool.query(
        "DELETE FROM products WHERE id=$1",
        [req.params.id]
    );

    res.json({
        message: "Product Deleted Successfully"
    });
};