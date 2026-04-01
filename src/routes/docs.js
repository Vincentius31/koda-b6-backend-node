import { Router } from "express";
import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express"

const options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: 'Backend CoffeeShop Vincent',
            version: '1.0.0'
        }
    },
    apis: ["./src/routes/*.router.js"]
}

const docs = swaggerJSDoc(options)

const docsRouter = Router()

docsRouter.use("", swaggerUi.serve, swaggerUi.setup(docs))

export default docsRouter