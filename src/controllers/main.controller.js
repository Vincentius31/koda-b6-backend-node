import { constants } from "node:http2"
import * as productsModel from "../models/products.models.js"
import * as reviewsModel from "../models/reviews.models.js"
import * as discountsModel from "../models/discounts.models.js"
import { getRedis } from "../lib/redis.js"

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
    const products = await productsModel.getRecommendedProducts()

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

/**
 * Get latest reviews for landing page
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<void>}
 */
export async function getLatestReviews(req, res) {
  try {
    const reviews = await reviewsModel.getLatestReviews()

    res.status(constants.HTTP_STATUS_OK).json({
      success: true,
      message: "Successfully retrieved the latest review",
      data: reviews
    })
  } catch (error) {
    console.error("Get latest reviews error:", error)
    res.status(constants.HTTP_STATUS_INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Failed to retrieve review data",
      data: null
    })
  }
}

/**
 * Get product catalog with pagination and filters
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<void>}
 */
export async function getProducts(req, res) {
  try {
    const page = parseInt(req.query.page) || 1
    const search = req.query.search || ""
    const category = req.query.category || ""
    const min_price = req.query.min_price || ""
    const max_price = req.query.max_price || ""

    const cacheKey = `products:${page}:${search}:${category}:${min_price}:${max_price}`

    const redis = await getRedis()
    const cachedData = await redis.get(cacheKey)

    if (cachedData) {
      const result = JSON.parse(cachedData)
      return res.status(constants.HTTP_STATUS_OK).json({
        success: true,
        message: "Fetch Products Successfully! (from cache)",
        data: result
      })
    }

    const result = await productsModel.getProductCatalog({ page, search, category, min_price, max_price })

    await redis.setEx(cacheKey, 900, JSON.stringify(result))

    res.status(constants.HTTP_STATUS_OK).json({
      success: true,
      message: "Fetch Products Successfully!",
      data: result
    })
  } catch (error) {
    console.error("Get products error:", error)
    res.status(constants.HTTP_STATUS_INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Failed to Fetch Products!",
      data: null
    })
  }
}

/**
 * Get all promos/discounts
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<void>}
 */
export async function getPromos(req, res) {
  try {
    const promos = await discountsModel.getAllDiscounts()

    res.status(constants.HTTP_STATUS_OK).json({
      success: true,
      message: "Successfully retrieved the promos",
      data: promos
    })
  } catch (error) {
    console.error("Get promos error:", error)
    res.status(constants.HTTP_STATUS_INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Failed to retrieve promos data",
      data: null
    })
  }
}

/**
 * Get product detail by ID
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<void>}
 */
export async function getProductDetail(req, res) {
  try {
    const id = parseInt(req.params.id)

    if (isNaN(id)) {
      return res.status(constants.HTTP_STATUS_BAD_REQUEST).json({
        success: false,
        message: "Invalid Product ID!"
      })
    }

    const product = await productsModel.getFullDetailByID(id)

    if (!product) {
      return res.status(constants.HTTP_STATUS_NOT_FOUND).json({
        success: false,
        message: "Product Not Found!"
      })
    }

    // Get random recommended products
    const recommended = await productsModel.getRandomRecommended(id, 15)

    res.status(constants.HTTP_STATUS_OK).json({
      success: true,
      message: "Product Detail Fetched Successfully!",
      data: {
        product,
        recommended
      }
    })
  } catch (error) {
    console.error("Get product detail error:", error)
    res.status(constants.HTTP_STATUS_INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Failed to fetch product detail",
      data: null
    })
  }
}