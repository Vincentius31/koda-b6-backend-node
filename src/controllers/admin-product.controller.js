import * as adminProductModel from "../models/admin-product.models.js"
import { BadRequestError, NotFoundError } from "../lib/AppError.js"

/**
 * Get available promos
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export async function getPromos(req, res) {
    const promos = await adminProductModel.getAvailablePromos()
    res.status(200).json({
        success: true,
        message: "Promos retrieved",
        data: promos
    })
}

/**
 * Get all products for admin
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export async function getAllProducts(req, res) {
    const products = await adminProductModel.getAllProducts()
    res.status(200).json({
        success: true,
        message: "Products retrieved",
        data: products
    })
}

/**
 * Get product by ID
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export async function getProductById(req, res) {
    const id = parseInt(req.params.id)
    if (isNaN(id)) {
        throw new BadRequestError("Invalid ID")
    }

    const product = await adminProductModel.getProductById(id)
    if (!product) {
        throw new NotFoundError("Product not found")
    }

    res.status(200).json({
        success: true,
        message: "Product found",
        data: product
    })
}

/**
 * Create new product
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export async function createProduct(req, res) {
    const payload = req.body

    if (!payload.nameProduct || payload.nameProduct.trim() === "") {
        throw new BadRequestError("Product name is required")
    }

    if (!payload.priceProduct || payload.priceProduct <= 0) {
        throw new BadRequestError("Price must be greater than zero")
    }

    if (payload.stockProduct !== undefined && payload.stockProduct < 0) {
        throw new BadRequestError("Stock cannot be negative")
    }

    await adminProductModel.createProduct(payload)
    res.status(201).json({
        success: true,
        message: "Product created successfully"
    })
}

/**
 * Update product
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export async function updateProduct(req, res) {
    const id = parseInt(req.params.id)
    if (isNaN(id)) {
        throw new BadRequestError("Invalid ID")
    }

    const payload = req.body

    // Check if product exists
    const existing = await adminProductModel.getProductById(id)
    if (!existing) {
        throw new NotFoundError("Product not found")
    }

    await adminProductModel.updateProduct(id, payload)
    res.status(200).json({
        success: true,
        message: "Product updated successfully"
    })
}

/**
 * Upload product images
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export async function uploadImages(req, res) {
    const id = parseInt(req.params.id)
    if (isNaN(id)) {
        throw new BadRequestError("Invalid ID")
    }

    if (!req.files || req.files.length === 0) {
        throw new BadRequestError("No images uploaded")
    }

    // Check if product exists
    const existing = await adminProductModel.getProductById(id)
    if (!existing) {
        throw new NotFoundError("Product not found")
    }

    const savedPaths = req.files.map(file => "/" + file.path)
    await adminProductModel.updateProductImages(id, savedPaths)

    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate")
    res.setHeader("Pragma", "no-cache")
    res.setHeader("Expires", "0")
    res.status(200).json({
        success: true,
        message: "Images uploaded successfully",
        data: savedPaths
    })
}

/**
 * Delete product
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export async function deleteProduct(req, res) {
    const id = parseInt(req.params.id)
    if (isNaN(id)) {
        throw new BadRequestError("Invalid ID")
    }

    const deleted = await adminProductModel.deleteProduct(id)
    if (!deleted) {
        throw new NotFoundError("Product not found")
    }

    res.status(200).json({
        success: true,
        message: "Product deleted successfully"
    })
}
