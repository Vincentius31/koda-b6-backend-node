import { Router } from "express"
import * as userController from "../controllers/users.controller.js"
import * as transactionController from "../controllers/transaction.controller.js"
import * as dashboardController from "../controllers/dashboard.controller.js"
import * as adminProductController from "../controllers/admin-product.controller.js"
import auth from "../middlewares/auth.middleware.js"
import uploadMiddleware, { uploadProfileMiddleware } from "../middlewares/upload,middleware.js"

const adminRouter = Router()

adminRouter.use(auth)

adminRouter.get("/dashboard/sales-category", dashboardController.getSalesCategory)
adminRouter.get("/dashboard/best-sellers", dashboardController.getBestSellers)
adminRouter.get("/dashboard/order-stats", dashboardController.getOrderStats)

adminRouter.get("/users", userController.getAllUsers)
adminRouter.get("/users/:id", userController.getUserById)
adminRouter.post("/users", userController.createUser)
adminRouter.patch("/users/:id", userController.updateUser)
adminRouter.patch("/users/:id/upload", uploadProfileMiddleware("uploads/users").single("profile_image"), userController.uploadUserProfile)
adminRouter.delete("/users/:id", userController.deleteUser)

adminRouter.get("/product/promos", adminProductController.getPromos)
adminRouter.get("/product", adminProductController.getAllProducts)
adminRouter.get("/product/:id", adminProductController.getProductById)
adminRouter.post("/product", adminProductController.createProduct)
adminRouter.patch("/product/:id", adminProductController.updateProduct)
adminRouter.patch("/product/:id/images", uploadMiddleware("uploads/products").array("images"), adminProductController.uploadImages)
adminRouter.delete("/product/:id", adminProductController.deleteProduct)

adminRouter.get("/transaction", transactionController.getAllTransactions)
adminRouter.get("/transaction/:id", transactionController.getTransactionById)
adminRouter.post("/transaction", transactionController.createTransaction)
adminRouter.patch("/transaction/:id", transactionController.updateTransaction)
adminRouter.delete("/transaction/:id", transactionController.deleteTransaction)

adminRouter.get("/transactionproduct", transactionController.getAllTransactionProducts)
adminRouter.get("/transactionproduct/:id", transactionController.getTransactionProductById)
adminRouter.post("/transactionproduct", transactionController.createTransactionProduct)
adminRouter.patch("/transactionproduct/:id", transactionController.updateTransactionProduct)
adminRouter.delete("/transactionproduct/:id", transactionController.deleteTransactionProduct)

export default adminRouter