import { Router } from 'express'
import { AuthController } from '~/api/v1/controllers/auth.controller'
import { authLimiter } from '~/api/v1/middlewares/rateLimiter.middleware'
import { validationReq } from '~/api/v1/middlewares/validation.middleware'
import { loginSchema, registerSchema } from '~/api/v1/validations/auth.validation'
const authRouter = Router()

const authController = new AuthController()

// ==================== PUBLIC ROUTES ====================
/**
 * @route   POST /api/v1/auth/register
 * @desc    Register a new user
 * @access  Public
 */
authRouter.post('/register', validationReq(registerSchema), authController.register)


/**
 * @route   POST /api/v1/auth/login
 * @desc    Login user
 * @access  Public
 */
authRouter.post('/login', validationReq(loginSchema), authController.login)

export default authRouter
