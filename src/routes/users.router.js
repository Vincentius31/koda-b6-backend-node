import { Router } from "express"
import * as cartController from "../controllers/cart.controller.js"
import * as transactionController from "../controllers/transaction.controller.js"
import * as userController from "../controllers/users.controller.js"
import auth from "../middlewares/auth.middleware.js"
import uploadMiddleware, { uploadProfileMiddleware } from "../middlewares/upload,middleware.js"

const userRouter = Router()

userRouter.use(auth)

userRouter.get("/profile", userController.getProfile)
userRouter.patch("/profile", userController.updateProfile)
userRouter.post("/profile/upload", uploadProfileMiddleware("uploads/users").single("profile_image"), userController.uploadProfilePicture)

userRouter.get("/cart", cartController.getUserCart)
userRouter.post("/cart", cartController.createCart)
userRouter.patch("/cart/:id", cartController.updateCart)
userRouter.delete("/cart/:id", cartController.deleteCart)

userRouter.post("/checkout", transactionController.checkout)
userRouter.get("/transactions", transactionController.getTransactionHistory)
userRouter.get("/transactions/:id", transactionController.getTransactionDetail)

export default userRouter