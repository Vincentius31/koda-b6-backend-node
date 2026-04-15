import pool from "../lib/db.js"

/**
 * Get role by name
 * @param {string} name
 * @param {import('pg').PoolClient} [client]
 * @returns {Promise<Object|null>}
 */
export async function getRoleByName(name, client = null) {
    const queryExecutor = client || pool
    const result = await queryExecutor.query(
        "SELECT * FROM roles WHERE name_roles = $1",
        [name]
    )
    return result.rows[0] || null
}
