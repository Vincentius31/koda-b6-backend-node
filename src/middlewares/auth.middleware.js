import { VerifyToken } from "../lib/jwt.js"
import { constants } from "node:http2"

/**
 * 
 * @param {import("express").Request} req 
 * @param {import("express").Response} res 
 * @param {import("express").NextFunction} next 
 */
export default function auth(req, res, next){
    const authHeader = req.headers.authorization
    const prefix = "Bearer "
    const isBearer = authHeader?.startsWith(prefix)
    if(isBearer){
        const token = authHeader.slice(prefix.length)
        const payload = VerifyToken(token)
        if(payload){
            res.locals = payload
            next()
            return
        }
    }
    res.status(constants.HTTP_STATUS_UNAUTHORIZED).json({
        success: false,
        message: "Unauthrorized"
    })
}