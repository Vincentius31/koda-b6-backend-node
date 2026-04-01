import { Router } from "express"
import * as landingController from "../controllers/landing.controller.js"

const mainRouter = Router()

mainRouter.get("/", function (req, res) {
  res.status(constants.HTTP_STATUS_OK).json({
    success: true,
    message: "Backend is running well!"
  })
})

mainRouter.get("/landing/recommended-products", landingController.getRecommendedProducts)
mainRouter.get("/landing/reviews", landingController.getLatestReviews)

export default mainRouter