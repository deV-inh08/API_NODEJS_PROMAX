import { Router } from 'express'
import { DiscountController } from '~/api/v1/controllers/discount.controller'
import { validationReq } from '~/api/v1/middlewares/validation.middleware'
import { createDiscountSchema, updateDiscountSchema } from '~/api/v1/validations/discount.validation'
import { AuthMiddleWare } from '~/api/v1/middlewares/auth.middleware'
import { authLimiter } from '~/api/v1/middlewares/rateLimiter.middleware'

export const discountRouter = Router()
const discountController = new DiscountController()
const authMiddleware = new AuthMiddleWare()

discountRouter.post(
  '/create',
  authMiddleware.verifyAT,
  validationReq(createDiscountSchema),
  discountController.createDiscount
)

discountRouter.post(
  '/update/:discountId',
  authMiddleware.verifyAT,
  validationReq(updateDiscountSchema),
  discountController.updateDiscount
)
