import { Router } from 'express'
import { validationReq } from '~/api/v1/middlewares/validation.middleware'
import { addToCartSchema, removeProductFromCartSchema } from '~/api/v1/validations/cart.validation'
import { AuthMiddleWare } from '~/api/v1/middlewares/auth.middleware'
import { CartController } from '~/api/v1/controllers/cart.controller'

export const cartRouter = Router()
const authMiddleware = new AuthMiddleWare()
const cartController = new CartController()

cartRouter.post('/add', authMiddleware.verifyAT, validationReq(addToCartSchema), cartController.addToCart)

cartRouter.delete(
  '/deleteAll/:cartId',
  authMiddleware.verifyAT,
  validationReq(removeProductFromCartSchema),
  cartController.deleteAllProductFromCart
)

cartRouter.get('/', authMiddleware.verifyAT, cartController.getListUserCart)