import { Router } from 'express'
import { AuthController } from '~/api/v1/controllers/auth.controller'
import { AuthMiddleWare } from '~/api/v1/middlewares/auth.middleware'
import { authLimiter } from '~/api/v1/middlewares/rateLimiter.middleware'
import { validationReq } from '~/api/v1/middlewares/validation.middleware'
import { loginSchema, logoutSchema, registerSchema } from '~/api/v1/validations/auth.validation'
import { refreshTokenSchema } from '~/api/v1/validations/token.validation'
const authRouter = Router()

const authController = new AuthController()
const authMiddleware = new AuthMiddleWare()

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

/**
 * @route   POST /api/v1/auth/refreshToken
 * @desc    client request API với AT & RT -> Server check AT -> Generate new AT & RT
 * @body accessToken (header request) & RT (body)
 * @access  Public
 */
authRouter.post(
  '/refresh-token',
  validationReq(refreshTokenSchema),
  authMiddleware.verifyAT,
  authController.refreshToken
)

/**
 * @route   POST /api/v1/auth/logout
 * @desc    client request API với AT & RT-> Server verify AT & RT, xem có cùng 1 user không ? -> Set RT.isActive = 'false'
 * @body accessToken (header) & RT (body)
 * @access  Public
 */
authRouter.post('/logout', validationReq(logoutSchema), authController.logout)

export default authRouter
