import pool from "../lib/db.js"

/**
 * @typedef {Object} Discount
 * @property {number} id_discount
 * @property {number} product_id
 * @property {number} discount_rate
 * @property {string} description
 * @property {boolean} is_flash_sale
 */

/**
 * Get all discounts
 * @returns {Promise<Discount[]>}
 */
export async function getAllDiscounts() {
  const result = await pool.query("SELECT * FROM discount ORDER BY id_discount ASC")
  return result.rows
}

/**
 * Get discount by id
 * @param {number} id_discount
 * @returns {Promise<Discount|null>}
 */
export async function getDiscountById(id_discount) {
  const result = await pool.query(
    "SELECT * FROM discount WHERE id_discount = $1",
    [id_discount]
  )
  return result.rows[0] || null
}

/**
 * Get discount by product id
 * @param {number} product_id
 * @returns {Promise<Discount|null>}
 */
export async function getDiscountByProductId(product_id) {
  const result = await pool.query(
    "SELECT * FROM discount WHERE product_id = $1",
    [product_id]
  )
  return result.rows[0] || null
}

/**
 * Create new discount
 * @param {Object} data
 * @returns {Promise<Discount>}
 */
export async function createDiscount(data) {
  const { product_id, discount_rate, description, is_flash_sale } = data
  const result = await pool.query(
    `INSERT INTO discount (product_id, discount_rate, description, is_flash_sale)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [product_id, discount_rate, description, is_flash_sale ?? false]
  )
  return result.rows[0]
}

/**
 * Update discount by id
 * @param {number} id_discount
 * @param {Object} data
 * @returns {Promise<Discount|null>}
 */
export async function updateDiscount(id_discount, data) {
  const fields = []
  const values = [id_discount]
  let paramCount = 2

  const allowedFields = ["product_id", "discount_rate", "description", "is_flash_sale"]

  for (const key of allowedFields) {
    if (data[key] !== undefined) {
      fields.push(`${key} = $${paramCount}`)
      values.push(data[key])
      paramCount++
    }
  }

  if (fields.length === 0) {
    return getDiscountById(id_discount)
  }

  const query = `UPDATE discount SET ${fields.join(", ")} WHERE id_discount = $1 RETURNING *`
  const result = await pool.query(query, values)
  return result.rows[0] || null
}

/**
 * Delete discount by id
 * @param {number} id_discount
 * @returns {Promise<Discount|null>}
 */
export async function deleteDiscount(id_discount) {
  const result = await pool.query(
    "DELETE FROM discount WHERE id_discount = $1 RETURNING *",
    [id_discount]
  )
  return result.rows[0] || null
}