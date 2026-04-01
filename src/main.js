import express from "express"
import authRouter from "./routes/auth.router.js"
import adminRouter from "./routes/admin.router.js"
import mainRouter from "./routes/main.router.js"
import docsRouter from "./routes/docs.js"
import usersRouter from "./routes/users.router.js"

const app = express()
const PORT = process.env.PORT || 8888

app.use(express.json())

app.use("/", mainRouter)
app.use("/auth", authRouter)
app.use("/admin", adminRouter)
app.use("/", usersRouter)
app.use("/docs", docsRouter)

app.listen(PORT, function () {
  console.log(`App listening on port ${PORT}`)
})