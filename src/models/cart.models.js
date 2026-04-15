import pool from "../lib/db.js"

/**
 * @typedef {Object} Cart
 * @property {number} id_cart
 * @property {number} user_id
 * @property {number} product_id
 * @property {number|null} variant_id
 * @property {number|null} size_id
 * @property {number} quantity
 */

/**
 * @typedef {Object} CartItemResponse
 * @property {number} id_cart
 * @property {number} product_id
 * @property {string} product_name
 * @property {string} product_image
 * @property {number} base_price
 * @property {number|null} variant_id
 * @property {string|null} variant_name
 * @property {number} variant_price
 * @property {number|null} size_id
 * @property {string|null} size_name
 * @property {number} size_price
 * @property {number} quantity
 */

/**
 * Create or update cart item
 * @param {Object} data
 * @param {number} data.user_id
 * @param {number} data.product_id
 * @param {number|null} data.variant_id
 * @param {number|null} data.size_id
 * @param {number} data.quantity
 * @returns {Promise<void>}
 */
export async function createCart(data) {
  const { user_id, product_id, variant_id, size_id, quantity } = data

  // Check if cart item already exists with same product, variant, and size
  const checkQuery = `
    SELECT id_cart, quantity FROM cart 
    WHERE user_id = $1 AND product_id = $2 
    AND (variant_id IS NULL OR variant_id = $3)
    AND (size_id IS NULL OR size_id = $4)
  `
  const checkResult = await pool.query(checkQuery, [user_id, product_id, variant_id ?? null, size_id ?? null])

  if (checkResult.rows.length > 0) {
    // Update quantity if exists
    const existingCart = checkResult.rows[0]
    const newQty = existingCart.quantity + quantity
    await pool.query(`UPDATE cart SET quantity = $1 WHERE id_cart = $2`, [newQty, existingCart.id_cart])
  } else {
    // Insert new cart item
    const insertQuery = `
      INSERT INTO cart (user_id, product_id, variant_id, size_id, quantity)
      VALUES ($1, $2, $3, $4, $5)
    `
    await pool.query(insertQuery, [user_id, product_id, variant_id ?? null, size_id ?? null, quantity])
  }
}

/**
 * Get cart items by user ID
 * @param {number} user_id
 * @returns {Promise<CartItemResponse[]>}
 */
export async function getUserCart(user_id) {
  const query = `
    SELECT 
      c.id_cart,
      c.product_id,
      p.name as product_name,
      COALESCE((SELECT path FROM product_images WHERE product_id = p.id_product LIMIT 1), '') as product_image,
      CAST(p.price - (p.price * COALESCE(d.discount_rate, 0)) AS INT) as base_price,
      c.variant_id,
      pv.variant_name,
      COALESCE(pv.additional_price, 0) as variant_price,
      c.size_id,
      ps.size_name,
      COALESCE(ps.additional_price, 0) as size_price,
      c.quantity
    FROM cart c
    JOIN products p ON c.product_id = p.id_product
    LEFT JOIN discount d ON p.id_product = d.product_id
    LEFT JOIN product_variant pv ON c.variant_id = pv.id_variant
    LEFT JOIN product_size ps ON c.size_id = ps.id_size
    WHERE c.user_id = $1
    ORDER BY c.id_cart DESC
  `
  const result = await pool.query(query, [user_id])
  return result.rows
}

/**
 * Get cart item by ID
 * @param {number} id_cart
 * @returns {Promise<Cart|null>}
 */
export async function getCartById(id_cart) {
  const result = await pool.query(
    "SELECT * FROM cart WHERE id_cart = $1",
    [id_cart]
  )
  return result.rows[0] || null
}

/**
 * Update cart quantity
 * @param {number} id_cart
 * @param {number} quantity
 * @returns {Promise<void>}
 */
export async function updateCartQty(id_cart, quantity) {
  await pool.query(`UPDATE cart SET quantity = $1 WHERE id_cart = $2`, [quantity, id_cart])
}

/**
 * Delete cart item
 * @param {number} id_cart
 * @returns {Promise<void>}
 */
export async function deleteCart(id_cart) {
  await pool.query(`DELETE FROM cart WHERE id_cart = $1`, [id_cart])
}

/**
 * Clear all cart items by user ID
 * @param {number} user_id
 * @returns {Promise<number>}
 */
export async function clearCartByUserId(user_id) {
  const result = await pool.query(`DELETE FROM cart WHERE user_id = $1`, [user_id])
  return result.rowCount
}