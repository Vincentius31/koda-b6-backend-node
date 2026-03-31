import { constants } from "node:http2"
import * as userModel from "../models/users.model.js"

/**
 * @typedef {import('express').Request} Request
 * @typedef {import('express').Response} Response
 */

/**
 * @param {Request} req
 * @param {Response} res
 * @returns {void}
 * 
 */
export function getAllUsers(req, res) {
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 5

    if (req.query.page || req.query.limit) {
        const result = userModel.getUsersPaginated(page, limit)

        if (page > result.pagination.totalPages) {
            return res.status(constants.HTTP_STATUS_NOT_FOUND).json({
                success: false,
                message: `Page ${page} not found. Total pages: ${result.pagination.totalPages}`,
                pagination: result.pagination
            })
        }

        return res.status(constants.HTTP_STATUS_OK).json({
            success: true,
            ...result
        })
    }

    const users = userModel.getAllUsers()
    res.status(constants.HTTP_STATUS_OK).json({
        success: true,
        data: users
    })
}

/**
 * 
 * @param {Request} req
 * @param {Response} res
 * @returns {void}
 * 
 */
export function getUserById(req, res) {
    const id = parseInt(req.params.id)
    const user = userModel.getUserById(id)

    if (!user) {
        return res.status(constants.HTTP_STATUS_NOT_FOUND).json({
            success: false,
            message: "User not found"
        })
    }

    res.status(constants.HTTP_STATUS_OK).json({
        success: true,
        data: user
    })
}

/**
 * 
 * @param {Request} req 
 * @param {Response} res
 * @returns {void}
 * 
 */
export function createUser(req, res) {
    const { email, password } = req.body

    if (!email || !password) {
        return res.status(constants.HTTP_STATUS_BAD_REQUEST).json({
            success: false,
            message: "Email and password are required"
        })
    }

    const newUser = userModel.createUser({ email, password })
    res.status(constants.HTTP_STATUS_CREATED).json({
        success: true,
        message: "User created successfully",
        data: newUser
    })
}

/**
 * 
 * @param {Request} req
 * @param {Response} res 
 * @returns {void}
 * 
 */
export function updateUser(req, res) {
    const id = parseInt(req.params.id)
    const { email, password } = req.body

    const updateData = {}
    if (email !== undefined) {
        updateData.email = email
    }
    if (password !== undefined) {
        updateData.password = password
    }

    const updatedUser = userModel.updateUser(id, updateData)

    if (!updatedUser) {
        return res.status(constants.HTTP_STATUS_NOT_FOUND).json({
            success: false,
            message: "User not found"
        })
    }

    res.status(constants.HTTP_STATUS_OK).json({
        success: true,
        message: "User updated successfully",
        data: updatedUser
    })
}

/**
 * 
 * @param {Request} req
 * @param {Response} res 
 * @returns {void}
 * 
 */
export function deleteUser(req, res) {
    const id = parseInt(req.params.id)
    const deletedUser = userModel.deleteUser(id)

    if (!deletedUser) {
        return res.status(constants.HTTP_STATUS_NOT_FOUND).json({
            success: false,
            message: "User not found"
        })
    }

    res.status(constants.HTTP_STATUS_OK).json({
        success: true,
        message: "User deleted successfully",
        data: deletedUser
    })
}