import { VerifyToken } from "../lib/jwt.js"
import * as userModel from "../models/users.models.js"
import { constants } from "node:http2"

/**
 * Auth middleware - verify token and fetch user with role
 * @param {import("express").Request} req 
 * @param {import("express").Response} res 
 * @param {import("express").NextFunction} next 
 */
export default async function auth(req, res, next) {
    const authHeader = req.headers.authorization
    const prefix = "Bearer "
    const isBearer = authHeader?.startsWith(prefix)

    if (isBearer) {
        const token = authHeader.slice(prefix.length)
        const payload = VerifyToken(token)

        if (payload) {
            const user = await userModel.getUserById(payload.id)

            if (user) {
                res.locals.user = user
                next()
                return
            }
        }
    }

    res.status(constants.HTTP_STATUS_UNAUTHORIZED).json({
        success: false,
        message: "Unauthorized"
    })
}

/**
 * Admin only middleware - check if user has admin role
 * @param {import("express").Request} req 
 * @param {import("express").Response} res 
 * @param {import("express").NextFunction} next 
 */
export function adminOnly(req, res, next) {
    const user = res.locals.user

    if (user && user.role_name === "admin") {
        next()
        return
    }

    res.status(constants.HTTP_STATUS_FORBIDDEN).json({
        success: false,
        message: "Forbidden - Admin access required"
    })
}