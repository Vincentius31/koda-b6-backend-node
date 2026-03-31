import express from "express"
import { constants } from "node:http2"
import usersRouter from "./routes/users.router.js"

const app = express()

app.use(express.json())

app.get("/", function (req, res) {
  res.status(constants.HTTP_STATUS_OK).json({
    success: true,
    message: "Backend is running well!"
  })
})

app.use("/users", usersRouter)

app.listen(8888, function () {
  console.log("App listening on port 8888")
})