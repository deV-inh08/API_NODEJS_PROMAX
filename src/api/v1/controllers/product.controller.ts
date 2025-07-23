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

      console.log('userId', userId)

      if (!userId) {
        throw new UnauthorizedError('User not authenticated')
      }

      const result = await this.productService.createProduct(body, userId)
      console.log('result', result)
      SuccessResponse.created(result, 'Product created succesfully').send(res)
    } catch (error) {
      next(error)
    }
  }
}
