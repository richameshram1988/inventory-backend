const pool = require("../config/db");

exports.createSale = async (req, res) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const { product_id, quantity } = req.body;

    let remainingSaleQty = quantity;
    let totalCost = 0;

    const batches = await client.query(
      `SELECT *
       FROM purchase_batches
       WHERE product_id = $1
       AND remaining_quantity > 0
       ORDER BY purchase_date ASC`,
      [product_id]
    );

    const sale = await client.query(
      `INSERT INTO sales(product_id, quantity, total_cost)
       VALUES($1, $2, $3)
       RETURNING *`,
      [product_id, quantity, 0]
    );

    const saleId = sale.rows[0].id;

    for (const batch of batches.rows) {
      if (remainingSaleQty <= 0) {
        break;
      }

      const consumeQty = Math.min(remainingSaleQty, batch.remaining_quantity);
      totalCost += consumeQty * batch.unit_cost;

      await client.query(
        `UPDATE purchase_batches
         SET remaining_quantity = remaining_quantity - $1
         WHERE id = $2`,
        [consumeQty, batch.id]
      );

      remainingSaleQty -= consumeQty;

      await client.query(
        `INSERT INTO sale_details(sale_id, batch_id, quantity, unit_cost)
         VALUES($1, $2, $3, $4)`,
        [saleId, batch.id, consumeQty, batch.unit_cost]
      );
    }

    // Agar stock kam pada aur poori quantity fulfill nahi hui
    if (remainingSaleQty > 0) {
      throw new Error(
        `Insufficient stock. ${remainingSaleQty} units short.`
      );
    }

    await client.query(
      `UPDATE sales
       SET total_cost = $1
       WHERE id = $2`,
      [totalCost, saleId]
    );

    await client.query("COMMIT");

    res.json({
      message: "Sale Completed",
      totalCost
    });

  } catch (err) {
    await client.query("ROLLBACK");
    console.log(err);
    res.status(500).json({
      message: err.message
    });
  } finally {
    client.release();
  }
};