import { Router } from "express"
import userRouter from "./users.router.js"
import auth from "./middlewares/auth.middleware.js"

const adminRouter = Router()

adminRouter.use(auth)

adminRouter.use("/users", userRouter)

export default adminRouter