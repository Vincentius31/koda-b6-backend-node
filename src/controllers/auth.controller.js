import { constants } from "node:http2"
import * as userModel from "../models/users.models.js"
import { GenerateHash, VerifyHash } from "../lib/hash.js"
import { GenerateToken } from "../lib/jwt.js"

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
  const client = await pool.connect()

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

    const hashedPassword = await GenerateHash(password)

    await client.query("BEGIN")

    const defaultRole = await rolesModel.getRoleByName("user", client)

    if (!defaultRole) {
      await client.query("ROLLBACK")
      return res.status(constants.HTTP_STATUS_INTERNAL_SERVER_ERROR).json({
        success: false,
        message: "Default role not found. Please contact administrator."
      })
    }

    const newUser = await userModel.createUser({
      fullname,
      email,
      password: hashedPassword,
      roles_id: defaultRole.id_roles
    }, client)

    await client.query("COMMIT")

    const { password: _, ...userWithoutPassword } = newUser

    res.status(constants.HTTP_STATUS_CREATED).json({
      success: true,
      message: "User registered successfully",
      data: userWithoutPassword
    })
  } catch (error) {
    await client.query("ROLLBACK")
    console.error("Register error:", error)
    res.status(constants.HTTP_STATUS_INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Internal server error"
    })
  } finally {
    client.release()
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

    const isValid = await VerifyHash(user.password, password)
    if (!isValid) {
      return res.status(constants.HTTP_STATUS_UNAUTHORIZED).json({
        success: false,
        message: "Invalid email or password"
      })
    }

    const token = GenerateToken({ id: user.id_user })

    const { password: _, ...userWithoutPassword } = user

    res.status(constants.HTTP_STATUS_OK).json({
      success: true,
      message: "Login successful",
      data: {
        ...userWithoutPassword,
        token
      }
    })
  } catch (error) {
    console.error("Login error:", error)
    res.status(constants.HTTP_STATUS_INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Internal server error"
    })
  }
}

/**
 * Request forgot password - generate OTP
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<void>}
 */
export async function requestForgotPassword(req, res) {
  try {
    const { email } = req.body

    if (!email) {
      return res.status(constants.HTTP_STATUS_BAD_REQUEST).json({
        success: false,
        message: "Email is required"
      })
    }

    // Check if email exists
    const user = await userModel.findUserByEmail(email)
    if (!user) {
      return res.status(constants.HTTP_STATUS_NOT_FOUND).json({
        success: false,
        message: "Email is not registered in our system"
      })
    }

    // Generate 6-digit OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000)

    // Save OTP to database
    await userModel.createForgotPasswordRequest(email, otpCode)

    // Log OTP (in production, send via email)
    console.log(`OTP for ${email}: ${otpCode}`)

    res.status(constants.HTTP_STATUS_OK).json({
      success: true,
      message: "OTP code has been sent to your email",
      data: {
        otp_code: otpCode // Remove this in production
      }
    })
  } catch (error) {
    console.error("Request forgot password error:", error)
    res.status(constants.HTTP_STATUS_INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Internal server error"
    })
  }
}

/**
 * Reset password with OTP
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<void>}
 */
export async function resetPassword(req, res) {
  try {
    const { email, otp_code, new_password } = req.body

    if (!email || !otp_code || !new_password) {
      return res.status(constants.HTTP_STATUS_BAD_REQUEST).json({
        success: false,
        message: "Email, OTP code, and new password are required"
      })
    }

    if (new_password.length < 5) {
      return res.status(constants.HTTP_STATUS_BAD_REQUEST).json({
        success: false,
        message: "Password must be at least 5 characters"
      })
    }

    // Verify OTP
    const forgotRequest = await userModel.getForgotPasswordByEmailAndCode(email, otp_code)
    if (!forgotRequest) {
      return res.status(constants.HTTP_STATUS_UNAUTHORIZED).json({
        success: false,
        message: "Invalid OTP code or email"
      })
    }

    // Get user
    const user = await userModel.findUserByEmail(email)
    if (!user) {
      return res.status(constants.HTTP_STATUS_NOT_FOUND).json({
        success: false,
        message: "User not found"
      })
    }

    // Update password
    await userModel.updateUser(user.id_user, { password: new_password })

    // Delete used OTP
    await userModel.deleteForgotPasswordByCode(otp_code)

    res.status(constants.HTTP_STATUS_OK).json({
      success: true,
      message: "Password has been updated successfully"
    })
  } catch (error) {
    console.error("Reset password error:", error)
    res.status(constants.HTTP_STATUS_INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Internal server error"
    })
  }
}