import pool from "../lib/db.js"

/**
 * @typedef {Object} ProductLanding
 * @property {number} id_product
 * @property {string} name
 * @property {string} desc
 * @property {number} price
 * @property {string} image_path
 * @property {number} total_review
 */

/**
 * @typedef {Object} ReviewLanding
 * @property {string} fullname
 * @property {string|null} profile_picture
 * @property {string} messages
 * @property {number} rating
 */

/**
 * Get recommended products (top 4 by review count)
 * @returns {Promise<ProductLanding[]>}
 */
export async function getRecommendedProducts() {
  const query = `
    SELECT 
      p.id_product, 
      p.name, 
      p.desc, 
      p.price,
      (SELECT pi.path FROM product_images pi WHERE pi.product_id = p.id_product LIMIT 1) as image_path,
      COUNT(rv.id_review) as total_review
    FROM products p
    LEFT JOIN review rv ON p.id_product = rv.product_id
    WHERE p.is_active = TRUE
    GROUP BY p.id_product
    ORDER BY total_review DESC
    LIMIT 4
  `
  const result = await pool.query(query)
  return result.rows
}

/**
 * Get latest reviews (5 most recent)
 * @returns {Promise<ReviewLanding[]>}
 */
export async function getLatestReviews() {
  const query = `
    SELECT 
      u.fullname AS fullname, 
      u.profile_picture AS profile_picture,
      r.messages AS messages, 
      r.rating AS rating
    FROM review r
    JOIN users u ON r.user_id = u.id_user
    ORDER BY r.id_review DESC
    LIMIT 5
  `
  const result = await pool.query(query)
  return result.rows
}