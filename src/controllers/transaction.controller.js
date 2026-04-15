import * as transactionModel from "../models/transaction.models.js"
import { BadRequestError, NotFoundError, UnauthorizedError, ForbiddenError } from "../lib/AppError.js"

/**
 * @typedef {import('express').Request} Request
 * @typedef {import('express').Response} Response
 */

/**
 * Get all transactions
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<void>}
 */
export async function getAllTransactions(req, res) {
  const transactions = await transactionModel.getAllTransactions()

  res.status(200).json({
    success: true,
    message: "Successfully retrieved all transactions",
    data: transactions
  })
}


/**
 * Get transaction by ID
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<void>}
 */
export async function getTransactionById(req, res) {
  const id = parseInt(req.params.id)

  if (isNaN(id)) {
    throw new BadRequestError("Invalid transaction ID")
  }

  const transaction = await transactionModel.getTransactionById(id)

  if (!transaction) {
    throw new NotFoundError("Transaction not found")
  }

  res.status(200).json({
    success: true,
    message: "Transaction found",
    data: transaction
  })
}

/**
 * Create new transaction
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<void>}
 */
export async function createTransaction(req, res) {
  const { user_id, transaction_number, delivery_method, subtotal, total, status, payment_method } = req.body

  if (!transaction_number || !delivery_method || subtotal === undefined || total === undefined || !payment_method) {
    throw new BadRequestError("transaction_number, delivery_method, subtotal, total, and payment_method are required")
  }

  const newTransaction = await transactionModel.createTransaction({
    user_id,
    transaction_number,
    delivery_method,
    subtotal,
    total,
    status,
    payment_method
  })

  res.status(201).json({
    success: true,
    message: "Transaction created successfully",
    data: newTransaction
  })
}

/**
 * Update transaction (partial update)
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<void>}
 */
export async function updateTransaction(req, res) {
  const id = parseInt(req.params.id)

  if (isNaN(id)) {
    throw new BadRequestError("Invalid transaction ID")
  }

  const { user_id, transaction_number, delivery_method, subtotal, total, status, payment_method } = req.body

  const updateData = {}
  if (user_id !== undefined) updateData.user_id = user_id
  if (transaction_number !== undefined) updateData.transaction_number = transaction_number
  if (delivery_method !== undefined) updateData.delivery_method = delivery_method
  if (subtotal !== undefined) updateData.subtotal = subtotal
  if (total !== undefined) updateData.total = total
  if (status !== undefined) updateData.status = status
  if (payment_method !== undefined) updateData.payment_method = payment_method

  const updatedTransaction = await transactionModel.updateTransaction(id, updateData)

  if (!updatedTransaction) {
    throw new NotFoundError("Transaction not found")
  }

  res.status(200).json({
    success: true,
    message: "Transaction updated successfully",
    data: updatedTransaction
  })
}

/**
 * Delete transaction
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<void>}
 */
export async function deleteTransaction(req, res) {
  const id = parseInt(req.params.id)

  if (isNaN(id)) {
    throw new BadRequestError("Invalid transaction ID")
  }

  const deletedTransaction = await transactionModel.deleteTransaction(id)

  if (!deletedTransaction) {
    throw new NotFoundError("Transaction not found")
  }

  res.status(200).json({
    success: true,
    message: "Transaction deleted successfully",
    data: deletedTransaction
  })
}

/**
 * Get all transaction products
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<void>}
 */
export async function getAllTransactionProducts(req, res) {
  const products = await transactionModel.getAllTransactionProducts()

  res.status(200).json({
    success: true,
    message: "Successfully retrieved items",
    data: products
  })
}

/**
 * Get transaction product by ID
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<void>}
 */
export async function getTransactionProductById(req, res) {
  const id = parseInt(req.params.id)

  if (isNaN(id)) {
    throw new BadRequestError("Invalid transaction product ID")
  }

  const product = await transactionModel.getTransactionProductById(id)

  if (!product) {
    throw new NotFoundError("Item not found")
  }

  res.status(200).json({
    success: true,
    message: "Item found",
    data: product
  })
}

/**
 * Create new transaction product
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<void>}
 */
export async function createTransactionProduct(req, res) {
  const { transaction_id, product_id, quantity, size, variant, price } = req.body

  if (!transaction_id || !quantity || price === undefined) {
    throw new BadRequestError("transaction_id, quantity, and price are required")
  }

  if (quantity < 1) {
    throw new BadRequestError("Quantity must be at least 1")
  }

  const newProduct = await transactionModel.createTransactionProduct({
    transaction_id,
    product_id,
    quantity,
    size,
    variant,
    price
  })

  res.status(201).json({
    success: true,
    message: "Item added to transaction",
    data: newProduct
  })
}

/**
 * Update transaction product (partial update)
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<void>}
 */
export async function updateTransactionProduct(req, res) {
  const id = parseInt(req.params.id)

  if (isNaN(id)) {
    throw new BadRequestError("Invalid transaction product ID")
  }

  const { transaction_id, product_id, quantity, size, variant, price } = req.body

  const updateData = {}
  if (transaction_id !== undefined) updateData.transaction_id = transaction_id
  if (product_id !== undefined) updateData.product_id = product_id
  if (quantity !== undefined) updateData.quantity = quantity
  if (size !== undefined) updateData.size = size
  if (variant !== undefined) updateData.variant = variant
  if (price !== undefined) updateData.price = price

  const updatedProduct = await transactionModel.updateTransactionProduct(id, updateData)

  if (!updatedProduct) {
    throw new NotFoundError("Item not found")
  }

  res.status(200).json({
    success: true,
    message: "Transaction item updated",
    data: updatedProduct
  })
}

/**
 * Delete transaction product
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<void>}
 */
export async function deleteTransactionProduct(req, res) {
  const id = parseInt(req.params.id)

  if (isNaN(id)) {
    throw new BadRequestError("Invalid transaction product ID")
  }

  const deletedProduct = await transactionModel.deleteTransactionProduct(id)

  if (!deletedProduct) {
    throw new NotFoundError("Item not found")
  }

  res.status(200).json({
    success: true,
    message: "Item removed from transaction",
    data: deletedProduct
  })
}

/**
 * Checkout - create transaction and products using DB transaction, return data, then delete
 * Clear cart after successful checkout
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<void>}
 */
export async function checkout(req, res) {
  // Get user_id from auth middleware
  const userId = res.locals.id
  const { transaction_number, delivery_method, subtotal, total, payment_method, items } = req.body

  // Validate required fields
  if (!transaction_number || !delivery_method || !payment_method || !items) {
    throw new BadRequestError("transaction_number, delivery_method, payment_method, and items are required")
  }

  if (!Array.isArray(items) || items.length === 0) {
    throw new BadRequestError("Cart cannot be empty!")
  }

  // Validate each item
  for (const item of items) {
    if (!item.product_id || !item.quantity || item.price === undefined) {
      throw new BadRequestError("Each item must have product_id, quantity, and price")
    }
    if (item.quantity < 1) {
      throw new BadRequestError("Quantity must be at least 1")
    }
  }

  // Import cart model for clearing cart
  const cartModelImport = await import("../models/cart.models.js")

  // Perform checkout with DB transaction
  const result = await transactionModel.checkout(
    {
      user_id: userId,
      transaction_number,
      delivery_method,
      subtotal,
      total,
      status: "Success",
      payment_method
    },
    items
  )

  // Clear user's cart after successful checkout
  await cartModelImport.clearCartByUserId(userId)

  res.status(201).json({
    success: true,
    message: "Checkout successful. Cart has been cleared.",
    data: result
  })
}


/**
 * Get transaction history for logged-in user
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<void>}
 */
export async function getTransactionHistory(req, res) {
  // Get user_id from res.locals (set by auth middleware)
  const userId = res.locals.id

  if (!userId) {
    throw new UnauthorizedError("Unauthorized. Please login.")
  }

  const history = await transactionModel.getTransactionHistoryByUserId(userId)

  res.status(200).json({
    success: true,
    message: "Successfully retrieved transaction history",
    data: history
  })
}

/**
 * Get transaction detail by ID for logged-in user
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<void>}
 */
export async function getTransactionDetail(req, res) {
  const id = parseInt(req.params.id)
  const userId = res.locals.id

  if (isNaN(id)) {
    throw new BadRequestError("Invalid transaction ID")
  }

  if (!userId) {
    throw new UnauthorizedError("Unauthorized. Please login.")
  }

  const detail = await transactionModel.getTransactionDetailById(id)

  if (!detail) {
    throw new NotFoundError("Transaction not found")
  }

  // Verify the transaction belongs to the logged-in user
  if (detail.user_id !== userId) {
    throw new ForbiddenError("You don't have permission to view this transaction")
  }

  res.status(200).json({
    success: true,
    message: "Successfully retrieved transaction detail",
    data: detail
  })
}