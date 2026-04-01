import pool from "../lib/db.js"

/**
 * @typedef {Object} Product
 * @property {number} id_product
 * @property {string} name
 * @property {string} desc
 * @property {number} price
 * @property {number} quantity
 * @property {boolean} is_active
 */

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
 * @typedef {Object} ProductCatalog
 * @property {number} id_product
 * @property {string} name
 * @property {string} desc
 * @property {number} price
 * @property {number} discount_rate
 * @property {number} discount_price
 * @property {number} rating
 * @property {string} image_path
 */

/**
 * Get all products
 * @returns {Promise<Product[]>}
 */
export async function getAllProducts() {
  const result = await pool.query("SELECT * FROM products ORDER BY id_product ASC")
  return result.rows
}

/**
 * Get product by id
 * @param {number} id_product
 * @returns {Promise<Product|null>}
 */
export async function getProductById(id_product) {
  const result = await pool.query(
    "SELECT * FROM products WHERE id_product = $1",
    [id_product]
  )
  return result.rows[0] || null
}

/**
 * Create new product
 * @param {Object} data
 * @returns {Promise<Product>}
 */
export async function createProduct(data) {
  const { name, desc, price, quantity, is_active } = data
  const result = await pool.query(
    `INSERT INTO products (name, "desc", price, quantity, is_active)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [name, desc, price, quantity, is_active ?? true]
  )
  return result.rows[0]
}

/**
 * Update product by id
 * @param {number} id_product
 * @param {Object} data
 * @returns {Promise<Product|null>}
 */
export async function updateProduct(id_product, data) {
  const fields = []
  const values = [id_product]
  let paramCount = 2

  const allowedFields = ["name", "desc", "price", "quantity", "is_active"]

  for (const key of allowedFields) {
    if (data[key] !== undefined) {
      fields.push(`"${key}" = $${paramCount}`)
      values.push(data[key])
      paramCount++
    }
  }

  if (fields.length === 0) {
    return getProductById(id_product)
  }

  const query = `UPDATE products SET ${fields.join(", ")} WHERE id_product = $1 RETURNING *`
  const result = await pool.query(query, values)
  return result.rows[0] || null
}

/**
 * Delete product by id
 * @param {number} id_product
 * @returns {Promise<Product|null>}
 */
export async function deleteProduct(id_product) {
  const result = await pool.query(
    "DELETE FROM products WHERE id_product = $1 RETURNING *",
    [id_product]
  )
  return result.rows[0] || null
}

/**
 * Get recommended products for landing page (top 4 by review count)
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
 * Get catalog of products with pagination and filters
 * @param {Object} params
 * @param {number} params.page
 * @param {string} params.search
 * @param {string} params.category
 * @param {string} params.min_price
 * @param {string} params.max_price
 * @returns {Promise<Object>}
 */
export async function getProductCatalog(params) {
  const { page = 1, search = "", category = "", min_price = "", max_price = "" } = params
  const limit = 6
  const offset = (page - 1) * limit

  const conditions = ["p.is_active = TRUE"]
  const args = []
  let paramCount = 1

  if (search) {
    conditions.push(`p.name ILIKE $${paramCount}`)
    args.push(`%${search}%`)
    paramCount++
  }

  if (category) {
    conditions.push(`c.name_category = $${paramCount}`)
    args.push(category)
    paramCount++
  }

  if (min_price && max_price) {
    conditions.push(`p.price BETWEEN $${paramCount} AND $${paramCount + 1}`)
    args.push(min_price, max_price)
    paramCount += 2
  }

  const whereSQL = conditions.join(" AND ")

  const countQuery = `
    SELECT COUNT(DISTINCT p.id_product) as total
    FROM products p
    LEFT JOIN products_category pc ON p.id_product = pc.product_id
    LEFT JOIN category c ON pc.category_id = c.id_category
    WHERE ${whereSQL}
  `
  const countResult = await pool.query(countQuery, args)
  const totalItems = parseInt(countResult.rows[0].total)
  const totalPages = Math.ceil(totalItems / limit)

  const fetchQuery = `
    SELECT 
      p.id_product, p.name, p.desc, p.price,
      COALESCE(d.discount_rate, 0) as discount_rate,
      CAST(p.price - (p.price * COALESCE(d.discount_rate, 0)) AS INT) as discount_price,
      COALESCE(AVG(rv.rating), 0) as rating,
      COALESCE((SELECT path FROM product_images WHERE product_id = p.id_product LIMIT 1), '') as image_path
    FROM products p
    LEFT JOIN discount d ON p.id_product = d.product_id
    LEFT JOIN review rv ON p.id_product = rv.product_id
    LEFT JOIN products_category pc ON p.id_product = pc.product_id
    LEFT JOIN category c ON pc.category_id = c.id_category
    WHERE ${whereSQL}
    GROUP BY p.id_product, d.discount_rate
    ORDER BY p.id_product DESC
    LIMIT $${paramCount} OFFSET $${paramCount + 1}
  `
  const finalArgs = [...args, limit, offset]
  const result = await pool.query(fetchQuery, finalArgs)

  return {
    items: result.rows,
    meta: {
      total_items: totalItems,
      total_pages: totalPages,
      current_page: page
    }
  }
}