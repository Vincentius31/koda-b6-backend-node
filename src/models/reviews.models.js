import pool from "../lib/db.js"

/**
 * @typedef {Object} Review
 * @property {number} id_review
 * @property {number} user_id
 * @property {number} product_id
 * @property {string} messages
 * @property {number} rating
 */

/**
 * @typedef {Object} ReviewLanding
 * @property {string} fullname
 * @property {string|null} profile_picture
 * @property {string} messages
 * @property {number} rating
 */

/**
 * Get all reviews
 * @returns {Promise<Review[]>}
 */
export async function getAllReviews() {
  const result = await pool.query("SELECT * FROM review ORDER BY id_review ASC")
  return result.rows
}

/**
 * Get review by id
 * @param {number} id_review
 * @returns {Promise<Review|null>}
 */
export async function getReviewById(id_review) {
  const result = await pool.query(
    "SELECT * FROM review WHERE id_review = $1",
    [id_review]
  )
  return result.rows[0] || null
}

/**
 * Create new review
 * @param {Object} data
 * @returns {Promise<Review>}
 */
export async function createReview(data) {
  const { user_id, product_id, messages, rating } = data
  const result = await pool.query(
    `INSERT INTO review (user_id, product_id, messages, rating)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [user_id, product_id, messages, rating]
  )
  return result.rows[0]
}

/**
 * Update review by id
 * @param {number} id_review
 * @param {Object} data
 * @returns {Promise<Review|null>}
 */
export async function updateReview(id_review, data) {
  const fields = []
  const values = [id_review]
  let paramCount = 2

  const allowedFields = ["user_id", "product_id", "messages", "rating"]

  for (const key of allowedFields) {
    if (data[key] !== undefined) {
      fields.push(`${key} = $${paramCount}`)
      values.push(data[key])
      paramCount++
    }
  }

  if (fields.length === 0) {
    return getReviewById(id_review)
  }

  const query = `UPDATE review SET ${fields.join(", ")} WHERE id_review = $1 RETURNING *`
  const result = await pool.query(query, values)
  return result.rows[0] || null
}

/**
 * Delete review by id
 * @param {number} id_review
 * @returns {Promise<Review|null>}
 */
export async function deleteReview(id_review) {
  const result = await pool.query(
    "DELETE FROM review WHERE id_review = $1 RETURNING *",
    [id_review]
  )
  return result.rows[0] || null
}

/**
 * Get latest reviews for landing page (5 most recent)
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