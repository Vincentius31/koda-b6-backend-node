import pool from "../lib/db.js"

/**
 * @typedef {Object} AdminProductPayload
 * @property {number} id
 * @property {string} nameProduct
 * @property {string} description
 * @property {number} priceProduct
 * @property {number} stock
 * @property {boolean} isActive
 * @property {string} category
 * @property {string} promoType
 * @property {number} priceDiscount
 * @property {string[]} imageProduct
 * @property {string[]} existingImages
 * @property {string[]} size
 * @property {string[]} temp
 * @property {string[]} method
 */

/**
 * Get available promos
 * @returns {Promise<string[]>}
 */
export async function getAvailablePromos() {
    const query = `SELECT DISTINCT description FROM discount WHERE description IS NOT NULL AND description != ''`
    const result = await pool.query(query)
    return result.rows.map(row => row.description)
}

/**
 * Create product with relations (images, sizes, variants, category, discount)
 * @param {AdminProductPayload} req
 * @returns {Promise<number>} product ID
 */
export async function createProduct(req) {
    const client = await pool.connect()
    try {
        await client.query("BEGIN")

        const productQuery = `INSERT INTO products (name, "desc", price, quantity, is_active) VALUES ($1, $2, $3, $4, true) RETURNING id_product`
        const productResult = await client.query(productQuery, [req.nameProduct, req.description, req.priceProduct, req.stock])
        const productId = productResult.rows[0].id_product

        // Insert images
        if (req.imageProduct && req.imageProduct.length > 0) {
            for (const img of req.imageProduct) {
                await client.query(`INSERT INTO product_images (product_id, path) VALUES ($1, $2)`, [productId, img])
            }
        }

        // Insert sizes
        if (req.size && req.size.length > 0) {
            for (const s of req.size) {
                let addPrice = 0
                if (s === "Large" || s === "500 gr") {
                    addPrice = 5000
                }
                await client.query(`INSERT INTO product_size (product_id, size_name, additional_price) VALUES ($1, $2, $3)`, [productId, s, addPrice])
            }
        }

        // Insert variants (temp)
        if (req.temp && req.temp.length > 0) {
            for (const t of req.temp) {
                await client.query(`INSERT INTO product_variant (product_id, variant_name, additional_price) VALUES ($1, $2, 0)`, [productId, t])
            }
        }

        // Insert category
        if (req.category) {
            const catResult = await client.query(`SELECT id_category FROM category WHERE name_category ILIKE $1 LIMIT 1`, [req.category])
            if (catResult.rows.length > 0) {
                const catId = catResult.rows[0].id_category
                await client.query(`INSERT INTO products_category (product_id, category_id) VALUES ($1, $2)`, [productId, catId])
            }
        }

        // Insert discount/promo
        if (req.promoType) {
            const rateResult = await client.query(`SELECT discount_rate FROM discount WHERE description = $1 LIMIT 1`, [req.promoType])
            if (rateResult.rows.length > 0) {
                const rate = rateResult.rows[0].discount_rate
                const isFlashSale = (req.promoType === "Flash Sale" || req.promoType === "FLASH SALE!")
                await client.query(`INSERT INTO discount (product_id, discount_rate, description, is_flash_sale) VALUES ($1, $2, $3, $4)`, [productId, rate, req.promoType, isFlashSale])
            }
        }

        await client.query("COMMIT")
        return productId
    } catch (error) {
        await client.query("ROLLBACK")
        throw error
    } finally {
        client.release()
    }
}

/**
 * Get all products for admin
 * @returns {Promise<AdminProductPayload[]>}
 */
export async function getAllProducts() {
    const query = `
    SELECT 
      p.id_product, p.name, p.desc, p.price, p.quantity,
      COALESCE(c.name_category, 'Coffee') as category,
      COALESCE(d.description, '') as promo_type,
      COALESCE(CAST(p.price - (p.price * d.discount_rate) AS INT), 0) as price_discount,
      COALESCE((SELECT array_agg(path) FROM product_images WHERE product_id = p.id_product), ARRAY[]::VARCHAR[]) as images,
      COALESCE((SELECT array_agg(size_name) FROM product_size WHERE product_id = p.id_product), ARRAY[]::VARCHAR[]) as sizes,
      COALESCE((SELECT array_agg(variant_name) FROM product_variant WHERE product_id = p.id_product), ARRAY[]::VARCHAR[]) as temps
    FROM products p
    LEFT JOIN products_category pc ON p.id_product = pc.product_id
    LEFT JOIN category c ON pc.category_id = c.id_category
    LEFT JOIN discount d ON p.id_product = d.product_id
    ORDER BY p.id_product DESC
  `
    const result = await pool.query(query)

    return result.rows.map(row => ({
        id: row.id_product,
        nameProduct: row.name,
        description: row.desc,
        priceProduct: row.price,
        stock: row.quantity,
        category: row.category,
        promoType: row.promo_type,
        priceDiscount: row.price_discount,
        imageProduct: row.images,
        size: row.sizes,
        temp: row.temps,
        method: ["Dine In", "Pick Up", "Door Delivery"]
    }))
}

/**
 * Get product by ID for admin
 * @param {number} id
 * @returns {Promise<AdminProductPayload|null>}
 */
export async function getProductById(id) {
    const query = `
    SELECT 
      p.id_product, p.name, p.desc, p.price, p.quantity,
      COALESCE(c.name_category, 'Coffee') as category,
      COALESCE(d.description, '') as promo_type,
      COALESCE(CAST(p.price - (p.price * d.discount_rate) AS INT), 0) as price_discount,
      COALESCE((SELECT array_agg(path) FROM product_images WHERE product_id = p.id_product), ARRAY[]::VARCHAR[]) as images,
      COALESCE((SELECT array_agg(size_name) FROM product_size WHERE product_id = p.id_product), ARRAY[]::VARCHAR[]) as sizes,
      COALESCE((SELECT array_agg(variant_name) FROM product_variant WHERE product_id = p.id_product), ARRAY[]::VARCHAR[]) as temps
    FROM products p
    LEFT JOIN products_category pc ON p.id_product = pc.product_id
    LEFT JOIN category c ON pc.category_id = c.id_category
    LEFT JOIN discount d ON p.id_product = d.product_id
    WHERE p.id_product = $1
  `
    const result = await pool.query(query, [id])

    if (result.rows.length === 0) {
        return null
    }

    const row = result.rows[0]
    return {
        id: row.id_product,
        nameProduct: row.name,
        description: row.desc,
        priceProduct: row.price,
        stock: row.quantity,
        category: row.category,
        promoType: row.promo_type,
        priceDiscount: row.price_discount,
        imageProduct: row.images,
        size: row.sizes,
        temp: row.temps,
        method: ["Dine In", "Pick Up", "Door Delivery"]
    }
}

/**
 * Update product with relations
 * @param {number} id
 * @param {AdminProductPayload} req
 * @returns {Promise<boolean>}
 */
export async function updateProduct(id, req) {
    const client = await pool.connect()
    try {
        await client.query("BEGIN")

        // Update main product
        await client.query(
            `UPDATE products SET name=$1, "desc"=$2, price=$3, quantity=$4 WHERE id_product=$5`,
            [req.nameProduct, req.description, req.priceProduct, req.stock, id]
        )

        // Delete existing relations
        await client.query(`DELETE FROM product_size WHERE product_id=$1`, [id])
        await client.query(`DELETE FROM product_variant WHERE product_id=$1`, [id])
        await client.query(`DELETE FROM discount WHERE product_id=$1`, [id])
        await client.query(`DELETE FROM products_category WHERE product_id=$1`, [id])

        // Insert new sizes
        if (req.size && req.size.length > 0) {
            for (const s of req.size) {
                let addPrice = 0
                if (s === "Large" || s === "500 gr") {
                    addPrice = 5000
                }
                await client.query(`INSERT INTO product_size (product_id, size_name, additional_price) VALUES ($1, $2, $3)`, [id, s, addPrice])
            }
        }

        // Insert new variants
        if (req.temp && req.temp.length > 0) {
            for (const t of req.temp) {
                await client.query(`INSERT INTO product_variant (product_id, variant_name, additional_price) VALUES ($1, $2, 0)`, [id, t])
            }
        }

        // Insert category
        if (req.category) {
            const catResult = await client.query(`SELECT id_category FROM category WHERE name_category ILIKE $1 LIMIT 1`, [req.category])
            if (catResult.rows.length > 0) {
                await client.query(`INSERT INTO products_category (product_id, category_id) VALUES ($1, $2)`, [id, catResult.rows[0].id_category])
            }
        }

        // Insert discount
        if (req.promoType) {
            const rateResult = await client.query(`SELECT discount_rate FROM discount WHERE description = $1 LIMIT 1`, [req.promoType])
            if (rateResult.rows.length > 0) {
                const rate = rateResult.rows[0].discount_rate
                const isFlashSale = (req.promoType === "Flash Sale" || req.promoType === "FLASH SALE!")
                await client.query(`INSERT INTO discount (product_id, discount_rate, description, is_flash_sale) VALUES ($1, $2, $3, $4)`, [id, rate, req.promoType, isFlashSale])
            }
        }

        await client.query("COMMIT")
        return true
    } catch (error) {
        await client.query("ROLLBACK")
        throw error
    } finally {
        client.release()
    }
}

/**
 * Update product images
 * @param {number} id
 * @param {string[]} paths
 * @returns {Promise<boolean>}
 */
export async function updateProductImages(id, paths) {
    const client = await pool.connect()
    try {
        await client.query("BEGIN")

        await client.query(`DELETE FROM product_images WHERE product_id=$1`, [id])
        for (const path of paths) {
            await client.query(`INSERT INTO product_images (product_id, path) VALUES ($1, $2)`, [id, path])
        }

        await client.query("COMMIT")
        return true
    } catch (error) {
        await client.query("ROLLBACK")
        throw error
    } finally {
        client.release()
    }
}

/**
 * Delete product
 * @param {number} id
 * @returns {Promise<boolean>}
 */
export async function deleteProduct(id) {
    const result = await pool.query(`DELETE FROM products WHERE id_product = $1`, [id])
    return result.rowCount > 0
}
