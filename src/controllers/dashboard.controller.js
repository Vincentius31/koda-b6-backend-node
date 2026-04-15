import { constants } from "node:http2"
import * as dashboardModel from "../models/dashboard.models.js"

/**
 * Get sales by category
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export async function getSalesCategory(req, res) {
    try {
        const data = await dashboardModel.getSalesByCategory()
        res.status(constants.HTTP_STATUS_OK).json({
            success: true,
            message: "Success fetching sales by category",
            data
        })
    } catch (error) {
        console.error("Get sales category error:", error)
        res.status(constants.HTTP_STATUS_INTERNAL_SERVER_ERROR).json({
            success: false,
            message: "Failed to fetch sales category: " + error.message
        })
    }
}

/**
 * Get best sellers
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export async function getBestSellers(req, res) {
    try {
        const limit = parseInt(req.query.limit) || 10
        const data = await dashboardModel.getBestSellers(limit)
        res.status(constants.HTTP_STATUS_OK).json({
            success: true,
            message: "Success fetching best sellers",
            data
        })
    } catch (error) {
        console.error("Get best sellers error:", error)
        res.status(constants.HTTP_STATUS_INTERNAL_SERVER_ERROR).json({
            success: false,
            message: "Failed to fetch best sellers: " + error.message
        })
    }
}

/**
 * Get order stats
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export async function getOrderStats(req, res) {
    try {
        const data = await dashboardModel.getOrderStats()
        res.status(constants.HTTP_STATUS_OK).json({
            success: true,
            message: "Success fetching order stats",
            data
        })
    } catch (error) {
        console.error("Get order stats error:", error)
        res.status(constants.HTTP_STATUS_INTERNAL_SERVER_ERROR).json({
            success: false,
            message: error.message
        })
    }
}
