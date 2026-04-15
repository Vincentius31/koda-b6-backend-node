import pool from "../lib/db.js"

/**
 * Get sales by category
 * @returns {Promise<Array>}
 */
export async function getSalesByCategory() {
    const query = `
    SELECT 
      c.name_category AS name, 
      COALESCE(SUM(tp.quantity), 0) AS sales, 
      COALESCE(SUM(tp.quantity * tp.price), 0) AS profit
    FROM category c
    JOIN products_category pc ON c.id_category = pc.category_id
    JOIN transaction_product tp ON pc.product_id = tp.product_id
    JOIN "transaction" t ON tp.transaction_id = t.id_transaction
    WHERE t.status = 'Done' 
    GROUP BY c.name_category
  `
    const result = await pool.query(query)
    return result.rows
}

/**
 * Get best sellers
 * @param {number} limit
 * @returns {Promise<Array>}
 */
export async function getBestSellers(limit = 10) {
    const query = `
    SELECT 
      p.name AS product_name, 
      COALESCE(SUM(tp.quantity), 0) AS sold, 
      COALESCE(SUM(tp.quantity * tp.price), 0) AS profit
    FROM products p
    JOIN transaction_product tp ON p.id_product = tp.product_id
    JOIN "transaction" t ON tp.transaction_id = t.id_transaction
    WHERE t.status = 'Done'
    GROUP BY p.id_product, p.name
    ORDER BY sold DESC
    LIMIT $1
  `
    const result = await pool.query(query, [limit])
    return result.rows
}

/**
 * Get order stats
 * @returns {Promise<Object>}
 */
export async function getOrderStats() {
    const query = `SELECT status, COUNT(id_transaction) FROM "transaction" GROUP BY status`
    const result = await pool.query(query)

    const stats = {
        on_progress: 0,
        shipping: 0,
        done: 0
    }

    for (const row of result.rows) {
        switch (row.status) {
            case "Pending":
            case "On Progress":
                stats.on_progress += parseInt(row.count)
                break
            case "Shipping":
                stats.shipping += parseInt(row.count)
                break
            case "Done":
                stats.done += parseInt(row.count)
                break
        }
    }

    return stats
}
