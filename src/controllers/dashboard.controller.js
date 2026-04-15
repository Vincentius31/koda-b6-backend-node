import * as dashboardModel from "../models/dashboard.models.js"

/**
 * Get sales by category
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export async function getSalesCategory(req, res) {
    const data = await dashboardModel.getSalesByCategory()
    res.status(200).json({
        success: true,
        message: "Success fetching sales by category",
        data
    })
}

/**
 * Get best sellers
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export async function getBestSellers(req, res) {
    const limit = parseInt(req.query.limit) || 10
    const data = await dashboardModel.getBestSellers(limit)
    res.status(200).json({
        success: true,
        message: "Success fetching best sellers",
        data
    })
}

/**
 * Get order stats
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export async function getOrderStats(req, res) {
    const data = await dashboardModel.getOrderStats()
    res.status(200).json({
        success: true,
        message: "Success fetching order stats",
        data
    })
}
