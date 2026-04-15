import * as userModel from "../models/users.models.js"
import * as hash from "../lib/hash.js"
import { BadRequestError, NotFoundError, ConflictError } from "../lib/AppError.js"

/**
 * @typedef {import('express').Request} Request
 * @typedef {import('express').Response} Response
 */

/**
 * Get all users or paginated users
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<void>}
 */
export async function getAllUsers(req, res) {
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 5

    if (req.query.page || req.query.limit) {
        const result = await userModel.getUsersPaginated(page, limit)

        if (page > result.pagination.totalPages && result.pagination.totalUsers > 0) {
            throw new NotFoundError(`Page ${page} not found. Total pages: ${result.pagination.totalPages}`)
        }

        return res.status(200).json({
            success: true,
            ...result
        })
    }

    const users = await userModel.getAllUsers()
    res.status(200).json({
        success: true,
        data: users
    })
}

/**
 * Get user by ID
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<void>}
 */
export async function getUserById(req, res) {
    const id = parseInt(req.params.id)

    if (isNaN(id)) {
        throw new BadRequestError("Invalid user ID")
    }

    const user = await userModel.getUserById(id)

    if (!user) {
        throw new NotFoundError("User not found")
    }

    res.status(200).json({
        success: true,
        data: user
    })
}

/**
 * Create new user
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<void>}
 */
export async function createUser(req, res) {
    const { fullname, email, password, roles_id, address, phone, profile_picture } = req.body

    if (!fullname || !email || !password) {
        throw new BadRequestError("Fullname, email, and password are required")
    }

    // Check if email already exists
    const existingUser = await userModel.findUserByEmail(email)
    if (existingUser) {
        throw new ConflictError("Email already exists")
    }

    const newUser = await userModel.createUser({
        fullname,
        email,
        password,
        roles_id,
        address,
        phone,
        profile_picture
    })

    res.status(201).json({
        success: true,
        message: "User created successfully",
        data: newUser
    })
}

/**
 * Update user (partial update)
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<void>}
 */
export async function updateUser(req, res) {
    const id = parseInt(req.params.id)

    if (isNaN(id)) {
        throw new BadRequestError("Invalid user ID")
    }

    const { fullname, email, password, roles_id, address, phone, profile_picture } = req.body

    if (email !== undefined) {
        const existingUser = await userModel.findUserByEmail(email)
        if (existingUser && existingUser.id_user !== id) {
            throw new ConflictError("Email already exists")
        }
    }

    const updateData = {}
    if (fullname !== undefined) updateData.fullname = fullname
    if (email !== undefined) updateData.email = email
    if (password !== undefined) updateData.password = password
    if (roles_id !== undefined) updateData.roles_id = roles_id
    if (address !== undefined) updateData.address = address
    if (phone !== undefined) updateData.phone = phone
    if (profile_picture !== undefined) updateData.profile_picture = profile_picture

    const updatedUser = await userModel.updateUser(id, updateData)

    if (!updatedUser) {
        throw new NotFoundError("User not found")
    }

    res.status(200).json({
        success: true,
        message: "User updated successfully",
        data: updatedUser
    })
}

/**
 * Delete user
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<void>}
 */
export async function deleteUser(req, res) {
    const id = parseInt(req.params.id)

    if (isNaN(id)) {
        throw new BadRequestError("Invalid user ID")
    }

    const deletedUser = await userModel.deleteUser(id)

    if (!deletedUser) {
        throw new NotFoundError("User not found")
    }

    res.status(200).json({
        success: true,
        message: "User deleted successfully",
        data: deletedUser
    })
}

/**
 * Get current user profile
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<void>}
 */
export async function getProfile(req, res) {
    const id = res.locals.user.id_user
    const user = await userModel.getUserById(id)

    if (!user) {
        throw new NotFoundError("User not found")
    }

    res.status(200).json({
        success: true,
        message: "Profile found",
        data: user
    })
}

/**
 * Update current user profile
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<void>}
 */
export async function updateProfile(req, res) {
    const id = res.locals.user.id_user
    const { fullname, email, password, address, phone, profile_picture } = req.body

    const updateData = {}
    if (fullname !== undefined) updateData.fullname = fullname
    if (email !== undefined) updateData.email = email
    if (password !== undefined) {
        if (password.length < 5) {
            throw new BadRequestError("Password must be at least 5 characters")
        }
        updateData.password = await hash.hashPassword(password)
    }
    if (address !== undefined) updateData.address = address
    if (phone !== undefined) updateData.phone = phone
    if (profile_picture !== undefined) updateData.profile_picture = profile_picture

    const updatedUser = await userModel.updateUser(id, updateData)

    if (!updatedUser) {
        throw new NotFoundError("User not found")
    }

    res.status(200).json({
        success: true,
        message: "Profile updated successfully",
        data: updatedUser
    })
}

/**
 * Upload profile picture for current user
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<void>}
 */
export async function uploadProfilePicture(req, res) {
    const id = res.locals.user.id_user

    if (!req.file) {
        throw new BadRequestError("No file uploaded")
    }

    const filename = req.file.filename
    await userModel.updateUser(id, { profile_picture: filename })

    res.status(200).json({
        success: true,
        message: "Profile picture uploaded successfully",
        data: { url: "/uploads/users/" + filename }
    })
}

/**
 * Upload profile picture for specific user (admin)
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<void>}
 */
export async function uploadUserProfile(req, res) {
    const id = parseInt(req.params.id)

    if (isNaN(id)) {
        throw new BadRequestError("Invalid user ID")
    }

    if (!req.file) {
        throw new BadRequestError("No file uploaded")
    }

    const filename = req.file.filename
    const updatedUser = await userModel.updateUser(id, { profile_picture: filename })

    if (!updatedUser) {
        throw new NotFoundError("User not found")
    }

    res.status(200).json({
        success: true,
        message: "Profile picture uploaded successfully",
        data: { url: "/uploads/users/" + filename }
    })
}