import type { Request, Response, NextFunction } from 'express'
import { ProductService } from '~/api/v1/services/product.service'
import { SuccessResponse, UnauthorizedError } from '~/api/v1/utils/response.util'
import { CreateProductType } from '~/api/v1/validations/product.validation'

export class ProductController {
  private productService: ProductService

  constructor() {
    this.productService = new ProductService()
  }

  createProduct = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const body: CreateProductType = req.body
      const decodeToken = req.decoded_accessToken!
      const userId = decodeToken.id

      if (!userId) {
        throw new UnauthorizedError('User not authenticated')
      }

      const result = await this.productService.createProduct(body, userId)
      SuccessResponse.created(result, 'Product created succesfully').send(res)
    } catch (error) {
      next(error)
    }
  }

  getAllDraftsForShop = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const decodeToken = req.decoded_accessToken!
      const userId = decodeToken.id
      if (!userId) {
        throw new UnauthorizedError('User not authenticated')
      }
      const result = await this.productService.getAllDraftsForShop(userId)
      SuccessResponse.ok(result, 'Get all drafts succesfully').send(res)
    } catch (error) {
      next(error)
    }
  }

  getAllPublishedForShop = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const decodedAT = req.decoded_accessToken!
      const user_id = decodedAT.id
      const result = await this.productService.getAllPublishedForShop(user_id)
      SuccessResponse.ok(result, 'Get all published product succesfully').send(res)
    } catch (error) {
      next(error)
    }
  }
}
