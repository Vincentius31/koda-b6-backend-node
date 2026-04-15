import { constants } from "node:http2"
import * as productsModel from "../models/products.models.js"
import * as reviewsModel from "../models/reviews.models.js"
import * as discountsModel from "../models/discounts.models.js"
import { getRedis } from "../lib/redis.js"
import { BadRequestError, NotFoundError } from "../lib/AppError.js"

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
  const products = await productsModel.getRecommendedProducts()

  res.status(constants.HTTP_STATUS_OK).json({
    success: true,
    message: "Success to load recommended products",
    data: products
  })
}

/**
 * Get latest reviews for landing page
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<void>}
 */
export async function getLatestReviews(req, res) {
  const reviews = await reviewsModel.getLatestReviews()

  res.status(constants.HTTP_STATUS_OK).json({
    success: true,
    message: "Successfully retrieved the latest review",
    data: reviews
  })
}

/**
 * Get product catalog with pagination and filters
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<void>}
 */
export async function getProducts(req, res) {
  const page = parseInt(req.query.page) || 1
  const search = req.query.search || ""
  const category = req.query.category || ""
  const min_price = req.query.min_price || ""
  const max_price = req.query.max_price || ""

  // Check Redis cache
  const redis = getRedis()
  const cacheKey = `products:${page}:${search}:${category}:${min_price}:${max_price}`

  if (redis) {
    const cachedData = await redis.get(cacheKey)

    if (cachedData) {
      const result = JSON.parse(cachedData)
      return res.status(constants.HTTP_STATUS_OK).json({
        success: true,
        message: "Fetch Products Successfully! (from cache)",
        data: result
      })
    }
  }

  const result = await productsModel.getProductCatalog({ page, search, category, min_price, max_price })

  if (redis) {
    const ttl = parseInt(process.env.REDIS_CACHE_TTL) || 60
    await redis.setEx(cacheKey, ttl, JSON.stringify(result))
  }

  res.status(constants.HTTP_STATUS_OK).json({
    success: true,
    message: "Fetch Products Successfully!",
    data: result
  })
}

/**
 * Get all promos/discounts
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<void>}
 */
export async function getPromos(req, res) {
  const promos = await discountsModel.getAllDiscounts()

  res.status(constants.HTTP_STATUS_OK).json({
    success: true,
    message: "Successfully retrieved the promos",
    data: promos
  })
}

/**
 * Get product detail by ID
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<void>}
 */
export async function getProductDetail(req, res) {
  const id = parseInt(req.params.id)

  if (isNaN(id)) {
    throw new BadRequestError("Invalid Product ID!")
  }

  const product = await productsModel.getFullDetailByID(id)

  if (!product) {
    throw new NotFoundError("Product Not Found!")
  }

  const recommended = await productsModel.getRandomRecommended(id, 15)

  res.status(constants.HTTP_STATUS_OK).json({
    success: true,
    message: "Product Detail Fetched Successfully!",
    data: {
      product,
      recommended
    }
  })
}