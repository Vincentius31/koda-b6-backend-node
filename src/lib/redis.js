import { createClient } from "redis"

const redisClient = createClient({
  url: process.env.REDIS_URL || "redis://localhost:6379"
})

redisClient.on("error", (err) => console.error("Redis Client Error:", err))

let isConnected = false

async function connectRedis() {
  if (!isConnected) {
    await redisClient.connect()
    isConnected = true
  }
  return redisClient
}

async function getRedis() {
  if (!isConnected) {
    await connectRedis()
  }
  return redisClient
}

export { connectRedis, getRedis, redisClient }
