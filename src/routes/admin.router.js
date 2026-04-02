import { Router } from "express"
import * as userController from "../controllers/users.controller.js"
import * as transactionController from "../controllers/transaction.controller.js"
import auth from "../middlewares/auth.middleware.js"

const adminRouter = Router()

adminRouter.use(auth)

adminRouter.get("/users", userController.getAllUsers)
adminRouter.get("/users/:id", userController.getUserById)
adminRouter.post("/users", userController.createUser)
adminRouter.patch("/users/:id", userController.updateUser)
adminRouter.delete("/users/:id", userController.deleteUser)

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