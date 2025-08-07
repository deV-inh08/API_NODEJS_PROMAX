import { Router } from 'express'
import { DiscountController } from '~/api/v1/controllers/discount.controller'
import { validationReq } from '~/api/v1/middlewares/validation.middleware'
import { createDiscountSchema, updateDiscountSchema } from '~/api/v1/validations/discount.validation'
import { AuthMiddleWare } from '~/api/v1/middlewares/auth.middleware'

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

discountRouter.get('/list-discounts', authMiddleware.verifyAT, discountController.getListDiscountByShop)

discountRouter.get(
  '/list-products/:discountCode',
  authMiddleware.verifyAT,
  discountController.getAllProductWithDiscountCode
)

discountRouter.post('/amount', authMiddleware.verifyAT, discountController.discountAmount)

discountRouter.delete('/delete', authMiddleware.verifyAT, discountController.deleteDiscount)
