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
 * @param {number} [page=1]
 * @param {number} [limit=5]
 * @returns {PaginatedResult}
 */
export function getUsersPaginated(page = 1, limit = 5) {
  const startIndex = (page - 1) * limit
  const endIndex = startIndex + limit
  const paginatedUsers = usersData.slice(startIndex, endIndex)
  const totalUsers = usersData.length
  const totalPages = Math.ceil(totalUsers / limit)

  return {
    data: paginatedUsers,
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
 * @param {number} id
 * @returns {User|undefined}
 */
export function getUserById(id) {
  return usersData.find(user => user.id === id)
}

/**
 * @param {User} data
 * @param {string} data.email
 * @param {string} data.password
 * @returns {User}
 */
export function createUser(data) {
  const newUser = {
    id: usersData.length > 0 ? Math.max(...usersData.map(u => u.id)) + 1 : 1,
    ...data
  }
  usersData.push(newUser)
  return newUser
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