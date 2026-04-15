import pool from "../lib/db.js"

/**
 * @typedef {Object} User
 * @property {number} id_user
 * @property {number} roles_id
 * @property {string} fullname
 * @property {string} email
 * @property {string} password
 * @property {string} address
 * @property {string} phone
 * @property {string} profile_picture
 */

/**
 * Find user by email
 * @param {string} email
 * @returns {Promise<User|null>}
 */
export async function findUserByEmail(email) {
  const result = await pool.query(
    "SELECT * FROM users WHERE email = $1",
    [email]
  )
  return result.rows[0] || null
}

/**
 * Get all users
 * @returns {Promise<User[]>}
 */
export async function getAllUsers() {
  const result = await pool.query("SELECT * FROM users ORDER BY id_user ASC")
  return result.rows
}

/**
 * Get users with pagination
 * @param {number} page
 * @param {number} limit
 * @returns {Promise<Object>}
 */
export async function getUsersPaginated(page = 1, limit = 5) {
  const offset = (page - 1) * limit

  const countResult = await pool.query("SELECT COUNT(*) as total FROM users")
  const totalUsers = parseInt(countResult.rows[0].total)
  const totalPages = Math.ceil(totalUsers / limit)

  const result = await pool.query(
    "SELECT * FROM users ORDER BY id_user ASC LIMIT $1 OFFSET $2",
    [limit, offset]
  )

  return {
    data: result.rows,
    pagination: {
      currentPage: page,
      limit: limit,
      totalUsers: totalUsers,
      totalPages: totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1
    }
  }
}

/**
 * Get user by id
 * @param {number} id_user
 * @returns {Promise<User|null>}
 */
export async function getUserById(id_user) {
  const result = await pool.query(
    "SELECT * FROM users WHERE id_user = $1",
    [id_user]
  )
  return result.rows[0] || null
}

/**
 * Create new user
 * @param {Object} data
 * @param {import('pg').PoolClient} [client]
 * @returns {Promise<User>}
 */
export async function createUser(data, client = null) {
  const queryExecutor = client || pool
  const { fullname, email, password, roles_id = null, address = null, phone = null, profile_picture = null } = data
  const result = await queryExecutor.query(
    `INSERT INTO users (fullname, email, password, roles_id, address, phone, profile_picture)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [fullname, email, password, roles_id, address, phone, profile_picture]
  )
  return result.rows[0]
}

/**
 * Update user by id
 * @param {number} id_user
 * @param {Object} data
 * @returns {Promise<User|null>}
 */
export async function updateUser(id_user, data) {
  const fields = []
  const values = [id_user]
  let paramCount = 2

  const allowedFields = ["fullname", "email", "password", "roles_id", "address", "phone", "profile_picture"]

  for (const key of allowedFields) {
    if (data[key] !== undefined) {
      fields.push(`${key} = $${paramCount}`)
      values.push(data[key])
      paramCount++
    }
  }

  if (fields.length === 0) {
    return getUserById(id_user)
  }

  const query = `UPDATE users SET ${fields.join(", ")} WHERE id_user = $1 RETURNING *`
  const result = await pool.query(query, values)
  return result.rows[0] || null
}

/**
 * Delete user by id
 * @param {number} id_user
 * @returns {Promise<User|null>}
 */
export async function deleteUser(id_user) {
  const result = await pool.query(
    "DELETE FROM users WHERE id_user = $1 RETURNING *",
    [id_user]
  )
  return result.rows[0] || null
}

/**
 * Create forgot password request
 * @param {string} email
 * @param {number} otpCode
 * @returns {Promise<Object>}
 */
export async function createForgotPasswordRequest(email, otpCode) {
  const result = await pool.query(
    `INSERT INTO forgot_password (email, otp_code) VALUES ($1, $2) RETURNING *`,
    [email, otpCode]
  )
  return result.rows[0]
}

/**
 * Get forgot password by email and OTP code
 * @param {string} email
 * @param {number} otpCode
 * @returns {Promise<Object|null>}
 */
export async function getForgotPasswordByEmailAndCode(email, otpCode) {
  const result = await pool.query(
    `SELECT * FROM forgot_password WHERE email = $1 AND otp_code = $2`,
    [email, otpCode]
  )
  return result.rows[0] || null
}

/**
 * Delete forgot password by OTP code
 * @param {number} otpCode
 * @returns {Promise<number>}
 */
export async function deleteForgotPasswordByCode(otpCode) {
  const result = await pool.query(
    `DELETE FROM forgot_password WHERE otp_code = $1`,
    [otpCode]
  )
  return result.rowCount
}