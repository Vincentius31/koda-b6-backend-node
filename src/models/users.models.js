import pool from "../db/index.js"

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
 * @returns {Promise<User>}
 */
export async function createUser(data) {
  const { fullname, email, password, roles_id = null, address = null, phone = null, profile_picture = null } = data
  const result = await pool.query(
    `INSERT INTO users (fullname, email, password, roles_id, address, phone, profile_picture)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [fullname, email, password, roles_id, address, phone, profile_picture]
  )
  return result.rows[0]
}

/**
 * @param {number} id 
 * @param {Partial<User>} data 
 * @returns {User|null} 
 */
export function updateUser(id, data) {
  const foundIndex = usersData.findIndex(user => user.id === id)
  if (foundIndex === -1) {
    return null
  }
  usersData[foundIndex] = {
    ...usersData[foundIndex],
    ...data
  }
  return usersData[foundIndex]
}

/**
 * @param {number} id 
 * @returns {User|null}
 */
export function deleteUser(id) {
  const foundIndex = usersData.findIndex(user => user.id === id)
  if (foundIndex === -1) {
    return null
  }
  const deletedUser = usersData.splice(foundIndex, 1)
  return deletedUser[0]
}