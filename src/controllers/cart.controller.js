import { constants } from "node:http2"
import * as cartModel from "../models/carts.model.js"

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
  try {
    const { product_id, variant_id, size_id, quantity } = req.body
    const user_id = res.locals.id

    if (!product_id || !quantity || quantity < 1) {
      return res.status(constants.HTTP_STATUS_BAD_REQUEST).json({
        success: false,
        message: "Product ID and quantity (min 1) are required"
      })
    }

    await cartModel.createCart({
      user_id,
      product_id,
      variant_id: variant_id ?? null,
      size_id: size_id ?? null,
      quantity
    })

    res.status(constants.HTTP_STATUS_CREATED).json({
      success: true,
      message: "Item added to cart"
    })
  } catch (error) {
    console.error("Create cart error:", error)
    res.status(constants.HTTP_STATUS_INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Failed to add to cart: " + error.message
    })
  }
}

/**
 * Get user cart
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<void>}
 */
export async function getUserCart(req, res) {
  try {
    const user_id = res.locals.id

    const cart = await cartModel.getUserCart(user_id)

    res.status(constants.HTTP_STATUS_OK).json({
      success: true,
      message: "Cart retrieved successfully",
      data: cart
    })
  } catch (error) {
    console.error("Get cart error:", error)
    res.status(constants.HTTP_STATUS_INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message
    })
  }
}

/**
 * Update cart item quantity
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<void>}
 */
export async function updateCart(req, res) {
  try {
    const { id } = req.params
    const { quantity } = req.body

    if (!quantity || quantity < 1) {
      return res.status(constants.HTTP_STATUS_BAD_REQUEST).json({
        success: false,
        message: "Quantity must be at least 1"
      })
    }

    await cartModel.updateCartQty(parseInt(id), quantity)

    res.status(constants.HTTP_STATUS_OK).json({
      success: true,
      message: "Cart updated"
    })
  } catch (error) {
    console.error("Update cart error:", error)
    res.status(constants.HTTP_STATUS_INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message
    })
  }
}

/**
 * Delete cart item
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<void>}
 */
export async function deleteCart(req, res) {
  try {
    const { id } = req.params

    await cartModel.deleteCart(parseInt(id))

    res.status(constants.HTTP_STATUS_OK).json({
      success: true,
      message: "Item removed from cart"
    })
  } catch (error) {
    console.error("Delete cart error:", error)
    res.status(constants.HTTP_STATUS_INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message
    })
  }
}