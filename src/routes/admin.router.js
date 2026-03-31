import { Router } from "express"
import userRouter from "./users.router.js"

const adminRouter = Router()

adminRouter.use("/users", userRouter)

export default adminRouter