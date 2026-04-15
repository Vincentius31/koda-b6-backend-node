import pool from "../lib/db.js"
import * as userModel from "../models/users.models.js"
import * as rolesModel from "../models/roles.models.js"
import { GenerateHash, VerifyHash } from "../lib/hash.js"
import { GenerateToken } from "../lib/jwt.js"
import { BadRequestError, UnauthorizedError, NotFoundError, InternalServerError } from "../lib/AppError.js"

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
      throw new BadRequestError("Fullname, email, password, and confirm password are required")
    }

    if (password !== confirmPassword) {
      throw new BadRequestError("Password and confirm password do not match")
    }

    const existingUser = await userModel.findUserByEmail(email)
    if (existingUser) {
      throw new BadRequestError("Email already registered")
    }

    const hashedPassword = await GenerateHash(password)

    await client.query("BEGIN")

    const defaultRole = await rolesModel.getRoleByName("user", client)

    if (!defaultRole) {
      await client.query("ROLLBACK")
      throw new InternalServerError("Default role not found. Please contact administrator.")
    }

    const newUser = await userModel.createUser({
      fullname,
      email,
      password: hashedPassword,
      roles_id: defaultRole.id_roles
    }, client)

    await client.query("COMMIT")

    const { password: _, ...userWithoutPassword } = newUser

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: userWithoutPassword
    })
  } catch (error) {
    await client.query("ROLLBACK")
    throw error
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
  const { email, password } = req.body

  if (!email || !password) {
    throw new BadRequestError("Email and password are required")
  }

  const user = await userModel.findUserByEmail(email)

  if (!user) {
    throw new UnauthorizedError("Invalid email or password")
  }

  const isValid = await VerifyHash(user.password, password)
  if (!isValid) {
    throw new UnauthorizedError("Invalid email or password")
  }

  const token = GenerateToken({ id: user.id_user })

  const { password: _, ...userWithoutPassword } = user

  res.status(200).json({
    success: true,
    message: "Login successful",
    data: {
      ...userWithoutPassword,
      token
    }
  })
}

/**
 * Request forgot password - generate OTP
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<void>}
 */
export async function requestForgotPassword(req, res) {
  const { email } = req.body

  if (!email) {
    throw new BadRequestError("Email is required")
  }

  const user = await userModel.findUserByEmail(email)
  if (!user) {
    throw new NotFoundError("Email is not registered in our system")
  }

  const otpCode = Math.floor(100000 + Math.random() * 900000)
  await userModel.createForgotPasswordRequest(email, otpCode)
  console.log(`OTP for ${email}: ${otpCode}`)

  res.status(200).json({
    success: true,
    message: "OTP code has been sent to your email",
    data: {
      otp_code: otpCode
    }
  })
}

/**
 * Reset password with OTP
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<void>}
 */
export async function resetPassword(req, res) {
  const { email, otp_code, new_password } = req.body

  if (!email || !otp_code || !new_password) {
    throw new BadRequestError("Email, OTP code, and new password are required")
  }

  if (new_password.length < 5) {
    throw new BadRequestError("Password must be at least 5 characters")
  }

  const forgotRequest = await userModel.getForgotPasswordByEmailAndCode(email, otp_code)
  if (!forgotRequest) {
    throw new UnauthorizedError("Invalid OTP code or email")
  }

  const user = await userModel.findUserByEmail(email)
  if (!user) {
    throw new NotFoundError("User not found")
  }

  await userModel.updateUser(user.id_user, { password: new_password })

  await userModel.deleteForgotPasswordByCode(otp_code)

  res.status(200).json({
    success: true,
    message: "Password has been updated successfully"
  })
}