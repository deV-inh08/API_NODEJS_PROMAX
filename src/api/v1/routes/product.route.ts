import { Router } from 'express'
import { ProductController } from '~/api/v1/controllers/product.controller'
import { AuthMiddleWare } from '~/api/v1/middlewares/auth.middleware'
import { validationReq } from '~/api/v1/middlewares/validation.middleware'
import { createProductSchema } from '~/api/v1/validations/product.validation'

export const productRouter = Router()
const authMiddleware = new AuthMiddleWare()
const productController = new ProductController()

productRouter.post(
  '/create',
  authMiddleware.verifyAT,
  validationReq(createProductSchema),
  productController.createProduct
)

productRouter.get('/all-drafts', authMiddleware.verifyAT, productController.getAllDraftsForShop)

productRouter.get('/all-published', authMiddleware.verifyAT, productController.getAllPublishedForShop)