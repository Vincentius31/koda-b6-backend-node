import { Router } from "express"
import { constants } from "node:http2"
import * as mainController from "../controllers/main.controller.js"

const mainRouter = Router()

mainRouter.get("/", function (req, res) {
  res.status(constants.HTTP_STATUS_OK).json({
    success: true,
    message: "Backend is running well!"
  })
})

mainRouter.get("/landing/recommended-products", mainController.getRecommendedProducts)
mainRouter.get("/landing/reviews", mainController.getLatestReviews)
mainRouter.get("/products", mainController.getProducts)
mainRouter.get("/products/promos", mainController.getPromos)
mainRouter.get("/detail-product/:id", mainController.getProductDetail)

export default mainRouter