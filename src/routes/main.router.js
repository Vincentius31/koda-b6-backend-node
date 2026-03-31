import { Router } from "express"
import * as landingController from "../controllers/landing.controller.js"

const mainRouter = Router()

mainRouter.get("/landing/recommended-products", landingController.getRecommendedProducts)

export default mainRouter