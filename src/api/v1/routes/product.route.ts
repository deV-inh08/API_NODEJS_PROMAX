import { Router } from 'express'
import { ProductController } from '~/api/v1/controllers/product.controller'
import { AuthMiddleWare } from '~/api/v1/middlewares/auth.middleware'
import { validateUpdateProduct, validationReq } from '~/api/v1/middlewares/validation.middleware'
import { createProductSchema, updateProductSchema } from '~/api/v1/validations/product.validation'

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

productRouter.patch('/publish/:productId', authMiddleware.verifyAT, productController.publishProductByShop)

productRouter.patch('/unPublish/:productId', authMiddleware.verifyAT, productController.updateUnPublishedProductForShop)

productRouter.get('/search', productController.searchProducts)

productRouter.get('/find', productController.findAllProducts)

productRouter.get('/find/:productId', productController.findProduct)

productRouter.patch(
  '/update/:productId',
  authMiddleware.verifyAT,
  validationReq(updateProductSchema),
  productController.updateProduct
)
