import { Router } from 'express'
import { AuthMiddleWare } from '~/api/v1/middlewares/auth.middleware'
import { validationReq } from '~/api/v1/middlewares/validation.middleware'
import { checkoutSchema } from '~/api/v1/validations/checkout.validation'
import { CheckoutController } from '~/api/v1/controllers/checkout.controller'

export const checkoutRouter = Router()
const authMiddleWare = new AuthMiddleWare()
const checkoutController = new CheckoutController()

checkoutRouter.post(
  '/preview',
  validationReq(checkoutSchema),
  authMiddleWare.verifyAT,
  checkoutController.checkoutReview
)
