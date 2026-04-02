import { Router } from "express"
import * as authController from "../controllers/auth.controller.js"

const authRouter = Router()

authRouter.post("/register", authController.register)
authRouter.post("/login", authController.login)
authRouter.post("/forgot-password", authController.requestForgotPassword)
authRouter.patch("/forgot-password", authController.resetPassword)

export default authRouter