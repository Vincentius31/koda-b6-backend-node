import { Router } from "express"
import * as landingController from "../controllers/landing.controller.js"

const mainRouter = Router()

mainRouter.get("/landing/recommended-products", landingController.getRecommendedProducts)
mainRouter.get("/landing/reviews", landingController.getLatestReviews)

export default mainRouter