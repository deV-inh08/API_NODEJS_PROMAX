import { Router } from 'express'
import { ForgotPasswordController } from '~/api/v1/controllers/forgotPassword.controller'
import { authLimiter } from '~/api/v1/middlewares/rateLimiter.middleware'
import { validationReq } from '~/api/v1/middlewares/validation.middleware'
import { forgotPasswordSchema, requestOTPSchema } from '~/api/v1/validations/auth.validation'

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


export default forgotPasswordRouter