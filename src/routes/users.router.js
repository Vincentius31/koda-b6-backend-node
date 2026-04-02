import { Router } from "express"
import * as cartController from "../controllers/cart.controller.js"
import * as transactionController from "../controllers/transaction.controller.js"
import auth from "../middlewares/auth.middleware.js"

const userRouter = Router()

userRouter.use(auth)

userRouter.get("/cart", cartController.getUserCart)
userRouter.post("/cart", cartController.createCart)
userRouter.patch("/cart/:id", cartController.updateCart)
userRouter.delete("/cart/:id", cartController.deleteCart)

userRouter.post("/checkout", transactionController.checkout)
userRouter.get("/history", transactionController.getTransactionHistory)
userRouter.get("/history/:id", transactionController.getTransactionDetail)

export default userRouter