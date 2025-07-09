import { Router } from 'express'
import { ForgotPasswordController } from '~/api/v1/controllers/forgotPassword.controller'
import { authLimiter } from '~/api/v1/middlewares/rateLimiter.middleware'
import { validationReq } from '~/api/v1/middlewares/validation.middleware'
import { requestOTPSchema, resetPasswordSchema, verifyOTPSchema } from '~/api/v1/validations/auth.validation'

const forgotPasswordRouter = Router()
const forgotPasswordController = new ForgotPasswordController()

/**
 * @route   POST /api/v1/forgot-password/request-otp
 * @desc    Request OTP for password reset
 * @body    { email: string }
 * @access  Public
 */
forgotPasswordRouter.post(
  '/request-otp',
  authLimiter,
  validationReq(requestOTPSchema),
  forgotPasswordController.requestOTP
)

/**
 * @route   POST /api/v1/forgot-password/verify-otp
 * @desc    Verify OTP
 * @body    { email: string, otp: string }
 * @access  Public
 */
forgotPasswordRouter.post(
  '/verify-otp',
  authLimiter,
  validationReq(verifyOTPSchema),
  forgotPasswordController.verifyOTP
)

/**
 * @route   POST /api/v1/forgot-password/reset-password
 * @desc    Reset password with OTP
 * @body    { email: string, newPassword: string, confirmPassword: string }
 * @access  Public
 */
forgotPasswordRouter.post(
  '/reset-password',
  authLimiter,
  validationReq(resetPasswordSchema),
  forgotPasswordController.resetPassword
)

/**
 * @route   POST /api/v1/forgot-password/resend-otp
 * @desc    Resend OTP
 * @body    { email: string }
 * @access  Public
 */

export default forgotPasswordRouter