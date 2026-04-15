import * as cartModel from "../models/cart.models.js"
import * as productsModel from "../models/products.models.js"
import { BadRequestError, NotFoundError, ForbiddenError } from "../lib/AppError.js"

/**
 * @typedef {import('express').Request} Request
 * @typedef {import('express').Response} Response
 */

/**
 * Create new cart item
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<void>}
 */
export async function createCart(req, res) {
  const { product_id, variant_id, size_id, quantity } = req.body
  const user_id = res.locals.id

  if (!product_id || !quantity || quantity < 1) {
    throw new BadRequestError("Product ID and quantity (min 1) are required")
  }

  // Check if product exists and is active
  const product = await productsModel.getProductById(product_id)
  if (!product) {
    throw new NotFoundError("Product not found")
  }
  if (!product.is_active) {
    throw new BadRequestError("Product is not available")
  }

  await cartModel.createCart({
    user_id,
    product_id,
    variant_id: variant_id ?? null,
    size_id: size_id ?? null,
    quantity
  })

  res.status(201).json({
    success: true,
    message: "Item added to cart"
  })
}

/**
 * Get user cart
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<void>}
 */
export async function getUserCart(req, res) {
  const user_id = res.locals.id

  const cart = await cartModel.getUserCart(user_id)

  res.status(200).json({
    success: true,
    message: "Cart retrieved successfully",
    data: cart
  })
}

/**
 * Update cart item quantity
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<void>}
 */
export async function updateCart(req, res) {
  const { id } = req.params
  const { quantity } = req.body
  const user_id = res.locals.id

  if (isNaN(parseInt(id))) {
    throw new BadRequestError("Invalid cart ID")
  }

  if (!quantity || quantity < 1) {
    throw new BadRequestError("Quantity must be at least 1")
  }

  // Check if cart item exists and belongs to user
  const cartItem = await cartModel.getCartById(parseInt(id))
  if (!cartItem) {
    throw new NotFoundError("Cart item not found")
  }
  if (cartItem.user_id !== user_id) {
    throw new ForbiddenError("You don't have permission to update this cart item")
  }

  await cartModel.updateCartQty(parseInt(id), quantity)

  res.status(200).json({
    success: true,
    message: "Cart updated"
  })
}

/**
 * Delete cart item
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<void>}
 */
export async function deleteCart(req, res) {
  const { id } = req.params
  const user_id = res.locals.id

  if (isNaN(parseInt(id))) {
    throw new BadRequestError("Invalid cart ID")
  }

  // Check if cart item exists and belongs to user
  const cartItem = await cartModel.getCartById(parseInt(id))
  if (!cartItem) {
    throw new NotFoundError("Cart item not found")
  }
  if (cartItem.user_id !== user_id) {
    throw new ForbiddenError("You don't have permission to delete this cart item")
  }

  await cartModel.deleteCart(parseInt(id))

  res.status(200).json({
    success: true,
    message: "Item removed from cart"
  })
}