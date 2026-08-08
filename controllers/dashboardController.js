
const pool = require("../config/db");
exports.stockOverview = async (req, res) => {

    try {

        const result = await pool.query(`
            SELECT
                p.id,
                p.name,
                SUM(pb.remaining_quantity) AS current_quantity,
                SUM(pb.remaining_quantity * pb.unit_cost) AS inventory_cost,

                CASE
                    WHEN SUM(pb.remaining_quantity)=0 THEN 0
                    ELSE
                        SUM(pb.remaining_quantity * pb.unit_cost) /
                        SUM(pb.remaining_quantity)
                END AS average_cost

            FROM products p

            LEFT JOIN purchase_batches pb
            ON p.id = pb.product_id

            GROUP BY p.id,p.name

            ORDER BY p.id
        `);

        res.json(result.rows);

    } catch(err){

        console.log(err);

        res.status(500).json({
            message:err.message
        });

    }

}
exports.transactionLedger = async(req,res)=>{

try{

const result=await pool.query(

`
 SELECT
      'PURCHASE' AS type,
      pb.purchase_date AS transaction_date,
      p.name AS product_name,
      pb.quantity,
      pb.unit_cost,
      NULL AS total_cost

    FROM purchase_batches pb

    INNER JOIN products p
      ON p.id = pb.product_id


    UNION ALL


    SELECT
      'SALE' AS type,
      s.sale_date AS transaction_date,
      p.name AS product_name,
      s.quantity,
      NULL AS unit_cost,
      s.total_cost

    FROM sales s

    INNER JOIN products p
      ON p.id = s.product_id


    ORDER BY transaction_date DESC;

`

);

res.json(result.rows);

}
catch(err){

console.log(err);

res.status(500).json({

message:err.message

});

}

}