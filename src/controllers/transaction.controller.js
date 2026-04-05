import { constants } from "node:http2"
import * as cartModel from "../models/cart.models.js"
import * as transactionModel from "../models/transaction.models.js"

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
  try {
    const transactions = await transactionModel.getAllTransactions()

    res.status(constants.HTTP_STATUS_OK).json({
      success: true,
      message: "Successfully retrieved all transactions",
      data: transactions
    })
  } catch (error) {
    console.error("Get all transactions error:", error)
    res.status(constants.HTTP_STATUS_INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Failed to fetch transactions",
      data: null
    })
  }
}


/**
 * Get transaction by ID
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<void>}
 */
export async function getTransactionById(req, res) {
  try {
    const id = parseInt(req.params.id)
    const transaction = await transactionModel.getTransactionById(id)

    if (!transaction) {
      return res.status(constants.HTTP_STATUS_NOT_FOUND).json({
        success: false,
        message: "Transaction not found",
        data: null
      })
    }

    res.status(constants.HTTP_STATUS_OK).json({
      success: true,
      message: "Transaction found",
      data: transaction
    })
  } catch (error) {
    console.error("Get transaction by id error:", error)
    res.status(constants.HTTP_STATUS_INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Internal server error",
      data: null
    })
  }
}

/**
 * Create new transaction
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<void>}
 */
export async function createTransaction(req, res) {
  try {
    const { user_id, transaction_number, delivery_method, subtotal, total, status, payment_method } = req.body

    if (!transaction_number || !delivery_method || subtotal === undefined || total === undefined || !payment_method) {
      return res.status(constants.HTTP_STATUS_BAD_REQUEST).json({
        success: false,
        message: "transaction_number, delivery_method, subtotal, total, and payment_method are required",
        data: null
      })
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

    res.status(constants.HTTP_STATUS_CREATED).json({
      success: true,
      message: "Transaction created successfully",
      data: newTransaction
    })
  } catch (error) {
    console.error("Create transaction error:", error)
    res.status(constants.HTTP_STATUS_INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message,
      data: null
    })
  }
}

/**
 * Update transaction (partial update)
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<void>}
 */
export async function updateTransaction(req, res) {
  try {
    const id = parseInt(req.params.id)
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
      return res.status(constants.HTTP_STATUS_NOT_FOUND).json({
        success: false,
        message: "Transaction not found",
        data: null
      })
    }

    res.status(constants.HTTP_STATUS_OK).json({
      success: true,
      message: "Transaction updated successfully",
      data: updatedTransaction
    })
  } catch (error) {
    console.error("Update transaction error:", error)
    res.status(constants.HTTP_STATUS_INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message,
      data: null
    })
  }
}

/**
 * Delete transaction
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<void>}
 */
export async function deleteTransaction(req, res) {
  try {
    const id = parseInt(req.params.id)
    const deletedTransaction = await transactionModel.deleteTransaction(id)

    if (!deletedTransaction) {
      return res.status(constants.HTTP_STATUS_NOT_FOUND).json({
        success: false,
        message: "Transaction not found",
        data: null
      })
    }

    res.status(constants.HTTP_STATUS_OK).json({
      success: true,
      message: "Transaction deleted successfully",
      data: deletedTransaction
    })
  } catch (error) {
    console.error("Delete transaction error:", error)
    res.status(constants.HTTP_STATUS_INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Failed to delete transaction",
      data: null
    })
  }
}

/**
 * Get all transaction products
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<void>}
 */
export async function getAllTransactionProducts(req, res) {
  try {
    const products = await transactionModel.getAllTransactionProducts()

    res.status(constants.HTTP_STATUS_OK).json({
      success: true,
      message: "Successfully retrieved items",
      data: products
    })
  } catch (error) {
    console.error("Get all transaction products error:", error)
    res.status(constants.HTTP_STATUS_INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Failed to fetch items",
      data: null
    })
  }
}

/**
 * Get transaction product by ID
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<void>}
 */
export async function getTransactionProductById(req, res) {
  try {
    const id = parseInt(req.params.id)
    const product = await transactionModel.getTransactionProductById(id)

    if (!product) {
      return res.status(constants.HTTP_STATUS_NOT_FOUND).json({
        success: false,
        message: "Item not found",
        data: null
      })
    }

    res.status(constants.HTTP_STATUS_OK).json({
      success: true,
      message: "Item found",
      data: product
    })
  } catch (error) {
    console.error("Get transaction product by id error:", error)
    res.status(constants.HTTP_STATUS_INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Internal server error",
      data: null
    })
  }
}

/**
 * Create new transaction product
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<void>}
 */
export async function createTransactionProduct(req, res) {
  try {
    const { transaction_id, product_id, quantity, size, variant, price } = req.body

    if (!transaction_id || !quantity || price === undefined) {
      return res.status(constants.HTTP_STATUS_BAD_REQUEST).json({
        success: false,
        message: "transaction_id, quantity, and price are required",
        data: null
      })
    }

    if (quantity < 1) {
      return res.status(constants.HTTP_STATUS_BAD_REQUEST).json({
        success: false,
        message: "Quantity must be at least 1",
        data: null
      })
    }

    const newProduct = await transactionModel.createTransactionProduct({
      transaction_id,
      product_id,
      quantity,
      size,
      variant,
      price
    })

    res.status(constants.HTTP_STATUS_CREATED).json({
      success: true,
      message: "Item added to transaction",
      data: newProduct
    })
  } catch (error) {
    console.error("Create transaction product error:", error)
    res.status(constants.HTTP_STATUS_INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message,
      data: null
    })
  }
}

/**
 * Update transaction product (partial update)
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<void>}
 */
export async function updateTransactionProduct(req, res) {
  try {
    const id = parseInt(req.params.id)
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
      return res.status(constants.HTTP_STATUS_NOT_FOUND).json({
        success: false,
        message: "Item not found",
        data: null
      })
    }

    res.status(constants.HTTP_STATUS_OK).json({
      success: true,
      message: "Transaction item updated",
      data: updatedProduct
    })
  } catch (error) {
    console.error("Update transaction product error:", error)
    res.status(constants.HTTP_STATUS_INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message,
      data: null
    })
  }
}

/**
 * Delete transaction product
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<void>}
 */
export async function deleteTransactionProduct(req, res) {
  try {
    const id = parseInt(req.params.id)
    const deletedProduct = await transactionModel.deleteTransactionProduct(id)

    if (!deletedProduct) {
      return res.status(constants.HTTP_STATUS_NOT_FOUND).json({
        success: false,
        message: "Item not found",
        data: null
      })
    }

    res.status(constants.HTTP_STATUS_OK).json({
      success: true,
      message: "Item removed from transaction",
      data: deletedProduct
    })
  } catch (error) {
    console.error("Delete transaction product error:", error)
    res.status(constants.HTTP_STATUS_INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message,
      data: null
    })
  }
}

/**
 * Checkout - create transaction and products using DB transaction, return data, then delete
 * Clear cart after successful checkout
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<void>}
 */
export async function checkout(req, res) {
  try {
    // Get user_id from auth middleware
    const userId = res.locals.id
    const { transaction_number, delivery_method, subtotal, total, payment_method, items } = req.body

    // Validate required fields
    if (!transaction_number || !delivery_method || !payment_method || !items) {
      return res.status(constants.HTTP_STATUS_BAD_REQUEST).json({
        success: false,
        message: "transaction_number, delivery_method, payment_method, and items are required",
        data: null
      })
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(constants.HTTP_STATUS_BAD_REQUEST).json({
        success: false,
        message: "Cart cannot be empty!",
        data: null
      })
    }

    // Validate each item
    for (const item of items) {
      if (!item.product_id || !item.quantity || item.price === undefined) {
        return res.status(constants.HTTP_STATUS_BAD_REQUEST).json({
          success: false,
          message: "Each item must have product_id, quantity, and price",
          data: null
        })
      }
      if (item.quantity < 1) {
        return res.status(constants.HTTP_STATUS_BAD_REQUEST).json({
          success: false,
          message: "Quantity must be at least 1",
          data: null
        })
      }
    }

    // Import cart model for clearing cart
    const cartModel = await import("../models/carts.model.js")

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
    await cartModel.clearCartByUserId(userId)

    res.status(constants.HTTP_STATUS_CREATED).json({
      success: true,
      message: "Checkout successful. Cart has been cleared.",
      data: result
    })
  } catch (error) {
    console.error("Checkout error:", error)
    res.status(constants.HTTP_STATUS_INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Checkout failed: " + error.message,
      data: null
    })
  }
}


/**
 * Get transaction history for logged-in user
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<void>}
 */
export async function getTransactionHistory(req, res) {
  try {
    // Get user_id from res.locals (set by auth middleware)
    const userId = res.locals.id
    
    if (!userId) {
      return res.status(constants.HTTP_STATUS_UNAUTHORIZED).json({
        success: false,
        message: "Unauthorized. Please login.",
        data: null
      })
    }
    
    const history = await transactionModel.getTransactionHistoryByUserId(userId)
    
    res.status(constants.HTTP_STATUS_OK).json({
      success: true,
      message: "Successfully retrieved transaction history",
      data: history
    })
  } catch (error) {
    console.error("Get transaction history error:", error)
    res.status(constants.HTTP_STATUS_INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Failed to retrieve transaction history",
      data: null
    })
  }
}

/**
 * Get transaction detail by ID for logged-in user
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<void>}
 */
export async function getTransactionDetail(req, res) {
  try {
    const id = parseInt(req.params.id)
    const userId = res.locals.id
    
    if (!userId) {
      return res.status(constants.HTTP_STATUS_UNAUTHORIZED).json({
        success: false,
        message: "Unauthorized. Please login.",
        data: null
      })
    }
    
    const detail = await transactionModel.getTransactionDetailById(id)
    
    if (!detail) {
      return res.status(constants.HTTP_STATUS_NOT_FOUND).json({
        success: false,
        message: "Transaction not found",
        data: null
      })
    }
    
    // Verify the transaction belongs to the logged-in user
    if (detail.user_id !== userId) {
      return res.status(constants.HTTP_STATUS_FORBIDDEN).json({
        success: false,
        message: "You don't have permission to view this transaction",
        data: null
      })
    }
    
    res.status(constants.HTTP_STATUS_OK).json({
      success: true,
      message: "Successfully retrieved transaction detail",
      data: detail
    })
  } catch (error) {
    console.error("Get transaction detail error:", error)
    res.status(constants.HTTP_STATUS_INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Failed to retrieve transaction detail",
      data: null
    })
  }
}