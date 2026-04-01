import { Router } from "express"
import * as userController from "../controllers/users.controller.js"
import auth from "../middlewares/auth.middleware.js"

const adminRouter = Router()

adminRouter.use(auth)

adminRouter.get("/users", userController.getAllUsers)
adminRouter.get("/users/:id", userController.getUserById)
adminRouter.post("/users", userController.createUser)
adminRouter.patch("/users/:id", userController.updateUser)
adminRouter.delete("/users/:id", userController.deleteUser)

export default adminRouter