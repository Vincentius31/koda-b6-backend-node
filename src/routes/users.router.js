import { Router } from "express"
import * as cartController from "../controllers/cart.controller"
import auth from "../middlewares/auth.middleware"

const userRouter = Router()

userRouter.use(auth)

userRouter.get("/cart", cartController.getUserCart)
userRouter.post("/cart", cartController.createCart)
userRouter.patch("/cart/:id", cartController.updateCart)
userRouter.delete("/cart/:id", cartController.deleteCart)

export default userRouter