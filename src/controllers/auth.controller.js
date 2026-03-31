import { constants } from "node:http2"
import * as userModel from "../models/users.models.js"

/**
 * @typedef {import('express').Request} Request
 * @typedef {import('express').Response} Response
 */

/**
 * Register new user
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<void>}
 */
export async function register(req, res) {
  try {
    const { fullname, email, password, confirmPassword } = req.body

    if (!fullname || !email || !password || !confirmPassword) {
      return res.status(constants.HTTP_STATUS_BAD_REQUEST).json({
        success: false,
        message: "Fullname, email, password, and confirm password are required"
      })
    }

    if (password !== confirmPassword) {
      return res.status(constants.HTTP_STATUS_BAD_REQUEST).json({
        success: false,
        message: "Password and confirm password do not match"
      })
    }

    const existingUser = await userModel.findUserByEmail(email)
    if (existingUser) {
      return res.status(constants.HTTP_STATUS_BAD_REQUEST).json({
        success: false,
        message: "Email already registered"
      })
    }

    const newUser = await userModel.createUser({
      fullname,
      email,
      password
    })

    const { password: _, ...userWithoutPassword } = newUser

    res.status(constants.HTTP_STATUS_CREATED).json({
      success: true,
      message: "User registered successfully",
      data: userWithoutPassword
    })
  } catch (error) {
    console.error("Register error:", error)
    res.status(constants.HTTP_STATUS_INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Internal server error"
    })
  }
}

/**
 * Login user
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<void>}
 */
export async function login(req, res) {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(constants.HTTP_STATUS_BAD_REQUEST).json({
        success: false,
        message: "Email and password are required"
      })
    }

    const user = await userModel.findUserByEmail(email)

    if (!user) {
      return res.status(constants.HTTP_STATUS_UNAUTHORIZED).json({
        success: false,
        message: "Invalid email or password"
      })
    }

    if (user.password !== password) {
      return res.status(constants.HTTP_STATUS_UNAUTHORIZED).json({
        success: false,
        message: "Invalid email or password"
      })
    }

    const { password: _, ...userWithoutPassword } = user

    res.status(constants.HTTP_STATUS_OK).json({
      success: true,
      message: "Login successful",
      data: userWithoutPassword
    })
  } catch (error) {
    console.error("Login error:", error)
    res.status(constants.HTTP_STATUS_INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Internal server error"
    })
  }
}