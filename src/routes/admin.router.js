import { Router } from "express"
import userRouter from "./users.router"

const adminRouter = Router()

adminRouter.use("/users", userRouter)

export default adminRouter