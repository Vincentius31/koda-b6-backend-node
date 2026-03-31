import { Router } from "express"
import * as userController from "../controllers/users.controller.js"

const router = Router()

router.get("/", userController.getAllUsers)
router.get("/:id", userController.getUserById)
router.post("/", userController.createUser)
router.patch("/:id", userController.updateUser)
router.delete("/:id", userController.deleteUser)

export default router