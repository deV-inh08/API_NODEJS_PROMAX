import { Router } from 'express'
import { AuthController } from '~/api/v1/controllers/auth.controller'
import { authLimiter } from '~/api/v1/middlewares/rateLimiter.middleware'
import { validationReq } from '~/api/v1/middlewares/validation.middleware'
import { registerSchema } from '~/api/v1/validations/auth.validation'
const authRouter = Router()

const authController = new AuthController()

// ==================== PUBLIC ROUTES ====================
/**
 * @route   POST /api/v1/auth/register
 * @desc    Register a new user
 * @access  Public
 */
authRouter.post('/register', authLimiter, validationReq(registerSchema), authController.register)


export default authRouter
