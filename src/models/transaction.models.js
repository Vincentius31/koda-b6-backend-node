import pool from "../lib/db.js"

/**
 * @typedef {Object} Transaction
 * @property {number} id_transaction
 * @property {number|null} user_id
 * @property {string} transaction_number
 * @property {string} delivery_method
 * @property {number} subtotal
 * @property {number} total
 * @property {string} status
 * @property {string} payment_method
 * @property {string} created_at
 */

/**
 * @typedef {Object} TransactionProduct
 * @property {number} id_trans_prod
 * @property {number} transaction_id
 * @property {number|null} product_id
 * @property {number} quantity
 * @property {string} size
 * @property {string} variant
 * @property {number} price
 */

/**
 * Get all transactions
 * @returns {Promise<Transaction[]>}
 */
export async function getAllTransactions() {
  const result = await pool.query(`
    SELECT id_transaction, user_id, transaction_number, delivery_method, 
           subtotal, total, status, payment_method, created_at 
    FROM "transaction"
    ORDER BY id_transaction DESC
  `)
  return result.rows
}

/**
 * Get transaction by ID
 * @param {number} id_transaction
 * @returns {Promise<Transaction|null>}
 */
export async function getTransactionById(id_transaction) {
  const result = await pool.query(`
    SELECT id_transaction, user_id, transaction_number, delivery_method, 
           subtotal, total, status, payment_method, created_at 
    FROM "transaction" 
    WHERE id_transaction = $1
  `, [id_transaction])
  return result.rows[0] || null
}

/**
 * Create new transaction
 * @param {Object} data
 * @param {number|null} data.user_id
 * @param {string} data.transaction_number
 * @param {string} data.delivery_method
 * @param {number} data.subtotal
 * @param {number} data.total
 * @param {string} data.status
 * @param {string} data.payment_method
 * @returns {Promise<Transaction>}
 */
export async function createTransaction(data) {
  const { user_id, transaction_number, delivery_method, subtotal, total, status = "Pending", payment_method } = data
  const result = await pool.query(`
    INSERT INTO "transaction" (user_id, transaction_number, delivery_method, subtotal, total, status, payment_method)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING id_transaction, user_id, transaction_number, delivery_method, subtotal, total, status, payment_method, created_at
  `, [user_id, transaction_number, delivery_method, subtotal, total, status, payment_method])
  return result.rows[0]
}

/**
 * Update transaction by ID
 * @param {number} id_transaction
 * @param {Object} data
 * @returns {Promise<Transaction|null>}
 */
export async function updateTransaction(id_transaction, data) {
  const fields = []
  const values = [id_transaction]
  let paramCount = 2

  const allowedFields = ["user_id", "transaction_number", "delivery_method", "subtotal", "total", "status", "payment_method"]

  for (const key of allowedFields) {
    if (data[key] !== undefined) {
      fields.push(`"${key}" = $${paramCount}`)
      values.push(data[key])
      paramCount++
    }
  }

  if (fields.length === 0) {
    return getTransactionById(id_transaction)
  }

  const query = `UPDATE "transaction" SET ${fields.join(", ")} WHERE id_transaction = $1 RETURNING *`
  const result = await pool.query(query, values)
  return result.rows[0] || null
}

/**
 * Delete transaction by ID
 * @param {number} id_transaction
 * @returns {Promise<Transaction|null>}
 */
export async function deleteTransaction(id_transaction) {
  const result = await pool.query(`
    DELETE FROM "transaction" WHERE id_transaction = $1 RETURNING *
  `, [id_transaction])
  return result.rows[0] || null
}


/**
 * Get all transaction products
 * @returns {Promise<TransactionProduct[]>}
 */
export async function getAllTransactionProducts() {
  const result = await pool.query(`
    SELECT id_trans_prod, transaction_id, product_id, quantity, size, variant, price 
    FROM transaction_product
    ORDER BY id_trans_prod DESC
  `)
  return result.rows
}

/**
 * Get transaction product by ID
 * @param {number} id_trans_prod
 * @returns {Promise<TransactionProduct|null>}
 */
export async function getTransactionProductById(id_trans_prod) {
  const result = await pool.query(`
    SELECT id_trans_prod, transaction_id, product_id, quantity, size, variant, price 
    FROM transaction_product 
    WHERE id_trans_prod = $1
  `, [id_trans_prod])
  return result.rows[0] || null
}

/**
 * Get transaction products by transaction ID
 * @param {number} transaction_id
 * @returns {Promise<TransactionProduct[]>}
 */
export async function getTransactionProductsByTransactionId(transaction_id) {
  const result = await pool.query(`
    SELECT id_trans_prod, transaction_id, product_id, quantity, size, variant, price 
    FROM transaction_product 
    WHERE transaction_id = $1
  `, [transaction_id])
  return result.rows
}

/**
 * Create new transaction product
 * @param {Object} data
 * @returns {Promise<TransactionProduct>}
 */
export async function createTransactionProduct(data) {
  const { transaction_id, product_id, quantity, size = "", variant = "", price } = data
  const result = await pool.query(`
    INSERT INTO transaction_product (transaction_id, product_id, quantity, size, variant, price)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING id_trans_prod, transaction_id, product_id, quantity, size, variant, price
  `, [transaction_id, product_id, quantity, size, variant, price])
  return result.rows[0]
}

/**
 * Update transaction product by ID
 * @param {number} id_trans_prod
 * @param {Object} data
 * @returns {Promise<TransactionProduct|null>}
 */
export async function updateTransactionProduct(id_trans_prod, data) {
  const fields = []
  const values = [id_trans_prod]
  let paramCount = 2

  const allowedFields = ["transaction_id", "product_id", "quantity", "size", "variant", "price"]

  for (const key of allowedFields) {
    if (data[key] !== undefined) {
      fields.push(`${key} = $${paramCount}`)
      values.push(data[key])
      paramCount++
    }
  }

  if (fields.length === 0) {
    return getTransactionProductById(id_trans_prod)
  }

  const query = `UPDATE transaction_product SET ${fields.join(", ")} WHERE id_trans_prod = $1 RETURNING *`
  const result = await pool.query(query, values)
  return result.rows[0] || null
}

/**
 * Delete transaction product by ID
 * @param {number} id_trans_prod
 * @returns {Promise<TransactionProduct|null>}
 */
export async function deleteTransactionProduct(id_trans_prod) {
  const result = await pool.query(`
    DELETE FROM transaction_product WHERE id_trans_prod = $1 RETURNING *
  `, [id_trans_prod])
  return result.rows[0] || null
}

/**
 * Delete all transaction products by transaction ID
 * @param {number} transaction_id
 * @returns {Promise<number>}
 */
export async function deleteTransactionProductsByTransactionId(transaction_id) {
  const result = await pool.query(`
    DELETE FROM transaction_product WHERE transaction_id = $1
  `, [transaction_id])
  return result.rowCount
}


/**
 * Checkout - create transaction and products using DB transaction, return data, then delete
 * @param {Object} transactionData
 * @param {Array} items
 * @returns {Promise<Object>}
 */
export async function checkout(transactionData, items) {
  const client = await pool.connect()
  
  try {
    await client.query("BEGIN")
    
    const { user_id, transaction_number, delivery_method, subtotal, total, status = "Pending", payment_method } = transactionData
    const transactionResult = await client.query(`
      INSERT INTO "transaction" (user_id, transaction_number, delivery_method, subtotal, total, status, payment_method)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id_transaction, user_id, transaction_number, delivery_method, subtotal, total, status, payment_method, created_at
    `, [user_id, transaction_number, delivery_method, subtotal, total, status, payment_method])
    
    const transaction = transactionResult.rows[0]
    const transactionId = transaction.id_transaction
    
    const transactionProducts = []
    for (const item of items) {
      const { product_id, quantity, size = "", variant = "", price } = item
      const productResult = await client.query(`
        INSERT INTO transaction_product (transaction_id, product_id, quantity, size, variant, price)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id_trans_prod, transaction_id, product_id, quantity, size, variant, price
      `, [transactionId, product_id, quantity, size, variant, price])
      transactionProducts.push(productResult.rows[0])
    }
    
    await client.query("COMMIT")
    
    const result = {
      transaction,
      products: transactionProducts
    }
    
    await deleteTransactionAndProducts(transactionId)
    
    return result
  } catch (error) {
    await client.query("ROLLBACK")
    throw error
  } finally {
    client.release()
  }
}

/**
 * Delete transaction and all its products
 * @param {number} transaction_id
 */
export async function deleteTransactionAndProducts(transaction_id) {
  const client = await pool.connect()
  
  try {
    await client.query("BEGIN")
    
    // Delete transaction products first (due to foreign key)
    await client.query("DELETE FROM transaction_product WHERE transaction_id = $1", [transaction_id])
    
    // Delete transaction
    await client.query("DELETE FROM \"transaction\" WHERE id_transaction = $1", [transaction_id])
    
    await client.query("COMMIT")
  } catch (error) {
    await client.query("ROLLBACK")
    throw error
  } finally {
    client.release()
  }
}

/**
 * Get transaction history by user ID
 * @param {number} user_id
 * @returns {Promise<Array>}
 */
export async function getTransactionHistoryByUserId(user_id) {
  const result = await pool.query(`
    SELECT 
      t.id_transaction,
      t.transaction_number,
      t.total,
      t.status,
      t.created_at
    FROM "transaction" t
    WHERE t.user_id = $1
    ORDER BY t.created_at DESC
  `, [user_id])
  return result.rows
}

/**
 * Get transaction detail with products and user info
 * @param {number} id_transaction
 * @returns {Promise<Object|null>}
 */
export async function getTransactionDetailById(id_transaction) {
  const transactionResult = await pool.query(`
    SELECT 
      t.id_transaction,
      t.user_id,
      t.transaction_number,
      t.delivery_method,
      t.subtotal,
      t.total,
      t.status,
      t.payment_method,
      t.created_at,
      u.fullname,
      u.address
    FROM "transaction" t
    LEFT JOIN users u ON t.user_id = u.id_user
    WHERE t.id_transaction = $1
  `, [id_transaction])
  
  if (transactionResult.rows.length === 0) {
    return null
  }
  
  const transaction = transactionResult.rows[0]
  
  const productsResult = await pool.query(`
    SELECT 
      tp.id_trans_prod,
      tp.transaction_id,
      tp.product_id,
      tp.quantity,
      tp.size,
      tp.variant,
      tp.price,
      p.name as product_name
    FROM transaction_product tp
    LEFT JOIN products p ON tp.product_id = p.id_product
    WHERE tp.transaction_id = $1
  `, [id_transaction])
  
  return {
    ...transaction,
    products: productsResult.rows
  }
}