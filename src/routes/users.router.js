import { Router } from "express"
import * as userController from "../controllers/users.controller.js"

const userRouter = Router()

userRouter.get("/", userController.getAllUsers)
userRouter.get("/:id", userController.getUserById)
userRouter.post("/", userController.createUser)
userRouter.patch("/:id", userController.updateUser)
userRouter.delete("/:id", userController.deleteUser)

export default userRouter