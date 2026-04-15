import { constants } from "node:http2"
import * as userModel from "../models/users.models.js"
import * as hash from "../lib/hash.js"

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
    try {
        const page = parseInt(req.query.page) || 1
        const limit = parseInt(req.query.limit) || 5

        if (req.query.page || req.query.limit) {
            const result = await userModel.getUsersPaginated(page, limit)

            if (page > result.pagination.totalPages && result.pagination.totalUsers > 0) {
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

        const users = await userModel.getAllUsers()
        res.status(constants.HTTP_STATUS_OK).json({
            success: true,
            data: users
        })
    } catch (error) {
        console.error("Get all users error:", error)
        res.status(constants.HTTP_STATUS_INTERNAL_SERVER_ERROR).json({
            success: false,
            message: "Internal server error"
        })
    }
}

/**
 * Get user by ID
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<void>}
 */
export async function getUserById(req, res) {
    try {
        const id = parseInt(req.params.id)
        const user = await userModel.getUserById(id)

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
    } catch (error) {
        console.error("Get user by id error:", error)
        res.status(constants.HTTP_STATUS_INTERNAL_SERVER_ERROR).json({
            success: false,
            message: "Internal server error"
        })
    }
}

/**
 * Create new user
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<void>}
 */
export async function createUser(req, res) {
    try {
        const { fullname, email, password, roles_id, address, phone, profile_picture } = req.body

        if (!fullname || !email || !password) {
            return res.status(constants.HTTP_STATUS_BAD_REQUEST).json({
                success: false,
                message: "Fullname, email, and password are required"
            })
        }

        // Check if email already exists
        const existingUser = await userModel.findUserByEmail(email)
        if (existingUser) {
            return res.status(constants.HTTP_STATUS_BAD_REQUEST).json({
                success: false,
                message: "Email already exists"
            })
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

        res.status(constants.HTTP_STATUS_CREATED).json({
            success: true,
            message: "User created successfully",
            data: newUser
        })
    } catch (error) {
        console.error("Create user error:", error)
        res.status(constants.HTTP_STATUS_INTERNAL_SERVER_ERROR).json({
            success: false,
            message: "Internal server error"
        })
    }
}

/**
 * Update user (partial update)
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<void>}
 */
export async function updateUser(req, res) {
    try {
        const id = parseInt(req.params.id)
        const { fullname, email, password, roles_id, address, phone, profile_picture } = req.body

        if (email !== undefined) {
            const existingUser = await userModel.findUserByEmail(email)
            if (existingUser && existingUser.id_user !== id) {
                return res.status(constants.HTTP_STATUS_BAD_REQUEST).json({
                    success: false,
                    message: "Email already exists"
                })
            }
        }

        const updateData = {}
        if (fullname !== undefined) {
            updateData.fullname = fullname
        }
        if (email !== undefined) {
            updateData.email = email
        }
        if (password !== undefined) {
            updateData.password = password
        }
        if (roles_id !== undefined) {
            updateData.roles_id = roles_id
        }
        if (address !== undefined) {
            updateData.address = address
        }
        if (phone !== undefined) {
            updateData.phone = phone
        }
        if (profile_picture !== undefined){
            updateData.profile_picture = profile_picture
        } 

        const updatedUser = await userModel.updateUser(id, updateData)

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
    } catch (error) {
        console.error("Update user error:", error)
        res.status(constants.HTTP_STATUS_INTERNAL_SERVER_ERROR).json({
            success: false,
            message: "Internal server error"
        })
    }
}

/**
 * Delete user
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<void>}
 */
export async function deleteUser(req, res) {
    try {
        const id = parseInt(req.params.id)
        const deletedUser = await userModel.deleteUser(id)

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
    } catch (error) {
        console.error("Delete user error:", error)
        res.status(constants.HTTP_STATUS_INTERNAL_SERVER_ERROR).json({
            success: false,
            message: "Internal server error"
        })
    }
}

/**
 * Get current user profile
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<void>}
 */
export async function getProfile(req, res) {
    try {
        const id = req.user.id_user
        const user = await userModel.getUserById(id)

        if (!user) {
            return res.status(constants.HTTP_STATUS_NOT_FOUND).json({
                success: false,
                message: "User not found"
            })
        }

        res.status(constants.HTTP_STATUS_OK).json({
            success: true,
            message: "Profile found",
            data: user
        })
    } catch (error) {
        console.error("Get profile error:", error)
        res.status(constants.HTTP_STATUS_INTERNAL_SERVER_ERROR).json({
            success: false,
            message: "Internal server error"
        })
    }
}

/**
 * Update current user profile
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<void>}
 */
export async function updateProfile(req, res) {
    try {
        const id = req.user.id_user
        const { fullname, email, password, address, phone, profile_picture } = req.body

        const updateData = {}
        if (fullname !== undefined) {
            updateData.fullname = fullname
        }
        if (email !== undefined) {
            updateData.email = email
        }
        if (password !== undefined) {
            if (password.length < 5) {
                return res.status(constants.HTTP_STATUS_BAD_REQUEST).json({
                    success: false,
                    message: "password must be at least 5 characters"
                })
            }
            updateData.password = await hash.hashPassword(password)
        }
        if (address !== undefined) {
            updateData.address = address
        }
        if (phone !== undefined) {
            updateData.phone = phone
        }
        if (profile_picture !== undefined) {
            updateData.profile_picture = profile_picture
        }

        const updatedUser = await userModel.updateUser(id, updateData)

        if (!updatedUser) {
            return res.status(constants.HTTP_STATUS_NOT_FOUND).json({
                success: false,
                message: "User not found"
            })
        }

        res.status(constants.HTTP_STATUS_OK).json({
            success: true,
            message: "Profile updated successfully",
            data: updatedUser
        })
    } catch (error) {
        console.error("Update profile error:", error)
        res.status(constants.HTTP_STATUS_INTERNAL_SERVER_ERROR).json({
            success: false,
            message: "Internal server error"
        })
    }
}

/**
 * Upload profile picture for current user
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<void>}
 */
export async function uploadProfilePicture(req, res) {
    try {
        const id = req.user.id_user

        if (!req.file) {
            return res.status(constants.HTTP_STATUS_BAD_REQUEST).json({
                success: false,
                message: "No file uploaded"
            })
        }

        const filename = req.file.filename
        await userModel.updateUser(id, { profile_picture: filename })

        res.status(constants.HTTP_STATUS_OK).json({
            success: true,
            message: "Profile picture uploaded successfully",
            data: { url: "/uploads/users/" + filename }
        })
    } catch (error) {
        console.error("Upload profile picture error:", error)
        res.status(constants.HTTP_STATUS_INTERNAL_SERVER_ERROR).json({
            success: false,
            message: "Failed to update profile picture in database"
        })
    }
}

/**
 * Upload profile picture for specific user (admin)
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<void>}
 */
export async function uploadUserProfile(req, res) {
    try {
        const id = parseInt(req.params.id)

        if (!req.file) {
            return res.status(constants.HTTP_STATUS_BAD_REQUEST).json({
                success: false,
                message: "No file uploaded"
            })
        }

        const filename = req.file.filename
        const updatedUser = await userModel.updateUser(id, { profile_picture: filename })

        if (!updatedUser) {
            return res.status(constants.HTTP_STATUS_NOT_FOUND).json({
                success: false,
                message: "User not found"
            })
        }

        res.status(constants.HTTP_STATUS_OK).json({
            success: true,
            message: "Profile picture uploaded successfully",
            data: { url: "/uploads/users/" + filename }
        })
    } catch (error) {
        console.error("Upload user profile error:", error)
        res.status(constants.HTTP_STATUS_INTERNAL_SERVER_ERROR).json({
            success: false,
            message: "Failed to update profile picture in database"
        })
    }
}