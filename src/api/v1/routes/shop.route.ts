import { Router } from 'express'
import { ShopController } from '~/api/v1/controllers/shop.controller'
import { AuthMiddleWare } from '~/api/v1/middlewares/auth.middleware'
import { validationReq } from '~/api/v1/middlewares/validation.middleware'
import { shopRegistrationSchema, verifyEmailSchema, verifyPhoneSchema } from '~/api/v1/validations/shop.validation'

const shopRouter = Router()
const shopController = new ShopController()
const authMiddleWare = new AuthMiddleWare()

/**
 * @route   POST /api/v1/seller/register
 * @desc    Register user as seller
 * @access  Private - Requires authentication
 */

shopRouter.post(
  '/upgrade/register-shop',
  authMiddleWare.verifyAT,
  validationReq(shopRegistrationSchema),
  shopController.registerShop
)

shopRouter.post(
  '/upgrade/verify-email',
  authMiddleWare.verifyAT,
  validationReq(verifyEmailSchema)
)

shopRouter.post(
  '/upgrade/verify-phone',
  authMiddleWare.verifyAT,
  validationReq(verifyPhoneSchema)
)

export default shopRouter
