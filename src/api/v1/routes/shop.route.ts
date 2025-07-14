import { Router } from 'express'
import { ShopController } from '~/api/v1/controllers/shop.controller'
import { AuthMiddleWare } from '~/api/v1/middlewares/auth.middleware'
import { validationReq } from '~/api/v1/middlewares/validation.middleware'
import { shopRegistrationSchema } from '~/api/v1/validations/shop.validation'

const shopRouter = Router()
const shopController = new ShopController()
const authMiddleWare = new AuthMiddleWare()

/**
 * @route   POST /api/v1/seller/register
 * @desc    Register user as seller
 * @access  Private - Requires authentication
 */

shopRouter.post(
  '/register',
  authMiddleWare.verifyAT,
  validationReq(shopRegistrationSchema),
  shopController.registerSeller
)

export default shopRouter
