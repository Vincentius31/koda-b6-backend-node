import { constants } from "node:http2"
import * as adminProductModel from "../models/admin-product.models.js"

/**
 * Get available promos
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export async function getPromos(req, res) {
    try {
        const promos = await adminProductModel.getAvailablePromos()
        res.status(constants.HTTP_STATUS_OK).json({
            success: true,
            message: "Promos retrieved",
            data: promos
        })
    } catch (error) {
        console.error("Get promos error:", error)
        res.status(constants.HTTP_STATUS_INTERNAL_SERVER_ERROR).json({
            success: false,
            message: "Failed to retrieve promos"
        })
    }
}

/**
 * Get all products for admin
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export async function getAllProducts(req, res) {
    try {
        const products = await adminProductModel.getAllProducts()
        res.status(constants.HTTP_STATUS_OK).json({
            success: true,
            message: "Products retrieved",
            data: products
        })
    } catch (error) {
        console.error("Get all products error:", error)
        res.status(constants.HTTP_STATUS_INTERNAL_SERVER_ERROR).json({
            success: false,
            message: "Failed to retrieve products"
        })
    }
}

/**
 * Get product by ID
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export async function getProductById(req, res) {
    try {
        const id = parseInt(req.params.id)
        if (isNaN(id)) {
            return res.status(constants.HTTP_STATUS_BAD_REQUEST).json({
                success: false,
                message: "Invalid ID"
            })
        }

        const product = await adminProductModel.getProductById(id)
        if (!product) {
            return res.status(constants.HTTP_STATUS_NOT_FOUND).json({
                success: false,
                message: "Product not found"
            })
        }

        res.status(constants.HTTP_STATUS_OK).json({
            success: true,
            message: "Product found",
            data: product
        })
    } catch (error) {
        console.error("Get product by id error:", error)
        res.status(constants.HTTP_STATUS_INTERNAL_SERVER_ERROR).json({
            success: false,
            message: "Failed to retrieve product"
        })
    }
}

/**
 * Create new product
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export async function createProduct(req, res) {
    try {
        const payload = req.body

        if (!payload.priceProduct || payload.priceProduct <= 0) {
            return res.status(constants.HTTP_STATUS_BAD_REQUEST).json({
                success: false,
                message: "price must be greater than zero"
            })
        }

        await adminProductModel.createProduct(payload)
        res.status(constants.HTTP_STATUS_CREATED).json({
            success: true,
            message: "Product created successfully"
        })
    } catch (error) {
        console.error("Create product error:", error)
        res.status(constants.HTTP_STATUS_INTERNAL_SERVER_ERROR).json({
            success: false,
            message: error.message
        })
    }
}

/**
 * Update product
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export async function updateProduct(req, res) {
    try {
        const id = parseInt(req.params.id)
        if (isNaN(id)) {
            return res.status(constants.HTTP_STATUS_BAD_REQUEST).json({
                success: false,
                message: "Invalid ID"
            })
        }

        const payload = req.body

        // Check if product exists
        const existing = await adminProductModel.getProductById(id)
        if (!existing) {
            return res.status(constants.HTTP_STATUS_NOT_FOUND).json({
                success: false,
                message: "product not found"
            })
        }

        await adminProductModel.updateProduct(id, payload)
        res.status(constants.HTTP_STATUS_OK).json({
            success: true,
            message: "Product updated successfully"
        })
    } catch (error) {
        console.error("Update product error:", error)
        res.status(constants.HTTP_STATUS_INTERNAL_SERVER_ERROR).json({
            success: false,
            message: error.message
        })
    }
}

/**
 * Upload product images
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export async function uploadImages(req, res) {
    try {
        const id = parseInt(req.params.id)
        if (isNaN(id)) {
            return res.status(constants.HTTP_STATUS_BAD_REQUEST).json({
                success: false,
                message: "Invalid ID"
            })
        }

        if (!req.files || req.files.length === 0) {
            return res.status(constants.HTTP_STATUS_BAD_REQUEST).json({
                success: false,
                message: "No images uploaded"
            })
        }

        // Check if product exists
        const existing = await adminProductModel.getProductById(id)
        if (!existing) {
            return res.status(constants.HTTP_STATUS_NOT_FOUND).json({
                success: false,
                message: "product not found"
            })
        }

        const savedPaths = req.files.map(file => "/" + file.path)
        await adminProductModel.updateProductImages(id, savedPaths)

        res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate")
        res.setHeader("Pragma", "no-cache")
        res.setHeader("Expires", "0")
        res.status(constants.HTTP_STATUS_OK).json({
            success: true,
            message: "Images uploaded successfully",
            data: savedPaths
        })
    } catch (error) {
        console.error("Upload images error:", error)
        res.status(constants.HTTP_STATUS_INTERNAL_SERVER_ERROR).json({
            success: false,
            message: error.message
        })
    }
}

/**
 * Delete product
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export async function deleteProduct(req, res) {
    try {
        const id = parseInt(req.params.id)
        if (isNaN(id)) {
            return res.status(constants.HTTP_STATUS_BAD_REQUEST).json({
                success: false,
                message: "Invalid ID"
            })
        }

        const deleted = await adminProductModel.deleteProduct(id)
        if (!deleted) {
            return res.status(constants.HTTP_STATUS_NOT_FOUND).json({
                success: false,
                message: "Product not found"
            })
        }

        res.status(constants.HTTP_STATUS_OK).json({
            success: true,
            message: "Product deleted successfully"
        })
    } catch (error) {
        console.error("Delete product error:", error)
        res.status(constants.HTTP_STATUS_INTERNAL_SERVER_ERROR).json({
            success: false,
            message: error.message
        })
    }
}
