/**
 * @typedef {Object} User
 * @property {number} id 
 * @property {string} email
 * @property {string} password
 */

/**
 * @typedef {Object} PaginationInfo
 * @property {number} currentPage 
 * @property {number} limit 
 * @property {number} totalUsers 
 * @property {number} totalPages
 * @property {boolean} hasNextPage 
 * @property {boolean} hasPrevPage 
 */

/**
 * @typedef {Object} PaginatedResult
 * @property {User[]} data 
 * @property {PaginationInfo} pagination
 */

/**
 * @type {User[]}
 */
export const usersData = [
  {
    id: 1,
    email: "user1@example.com",
    password: "pass123"
  },
  {
    id: 2,
    email: "user2@example.com",
    password: "pass123"
  },
  {
    id: 3,
    email: "user3@example.com",
    password: "pass123"
  },
  {
    id: 4,
    email: "user4@example.com",
    password: "pass123"
  },
  {
    id: 5,
    email: "user5@example.com",
    password: "pass123"
  },
  {
    id: 6,
    email: "user6@example.com",
    password: "pass123"
  },
  {
    id: 7,
    email: "user7@example.com",
    password: "pass123"
  },
  {
    id: 8,
    email: "user8@example.com",
    password: "pass123"
  },
  {
    id: 9,
    email: "user9@example.com",
    password: "pass123"
  },
  {
    id: 10,
    email: "user10@example.com",
    password: "pass123"
  }
]

/**
 * @returns {User[]} 
 */
export function getAllUsers() {
  return usersData
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