import { constants } from "node:http2"
import * as landingModel from "../models/landing.models.js"

/**
 * @typedef {import('express').Request} Request
 * @typedef {import('express').Response} Response
 */

/**
 * Get recommended products for landing page
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<void>}
 */
export async function getRecommendedProducts(req, res) {
  try {
    const products = await landingModel.getRecommendedProducts()

    res.status(constants.HTTP_STATUS_OK).json({
      success: true,
      message: "Success to load recommended products",
      data: products
    })
  } catch (error) {
    console.error("Get recommended products error:", error)
    res.status(constants.HTTP_STATUS_INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Failed to load recommended products",
      data: null
    })
  }
}