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
      const userId = decodedAT.id
      if (!userId) {
        throw new UnauthorizedError('User not authenticated')
      }
      const result = await this.productService.getAllPublishedForShop(userId)
      SuccessResponse.ok(result, 'Get all published product succesfully').send(res)
    } catch (error) {
      next(error)
    }
  }

  publishProductByShop = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { productId } = req.params // { productId: '68831462ab00440766ddf9de' }
      const decodedAT = req.decoded_accessToken!
      const userId = decodedAT.id
      if (!userId) {
        throw new UnauthorizedError('User not authenticated')
      }

      // call services
      const result = await this.productService.publishProductByShop(productId, userId)
      SuccessResponse.ok(result, 'Update published product succesfully').send(res)
    } catch (error) {
      next(error)
    }
  }
  updateUnPublishedProductForShop = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { productId } = req.params // { productId: '68831462ab00440766ddf9de' }
      console.log('productId', productId);
      const decodedAT = req.decoded_accessToken!
      const userId = decodedAT.id
      if (!userId) {
        throw new UnauthorizedError('User not authenticated')
      }

      // call services
      const result = await this.productService.updateUnPublishedProductForShop(productId, userId)
      SuccessResponse.ok(result, 'Update Unpublished product succesfully').send(res)
    } catch (error) {
      next(error)
    }
  }

  searchProducts = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const searchParams = {
        query: req.query.q as string,
        category: req.query.category as string,
        page: Number(req.query.page) || 1,
        limit: Number(req.query.page) || 20
      }

      console.log(searchParams.query);
      // Validate search query
      if (!searchParams.query || searchParams.query.trim().length < 2) {
        return SuccessResponse.ok(
          { products: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 0 } },
          'Search query too short'
        ).send(res)
      }
      const result = await this.productService.searchProducts(searchParams)
      SuccessResponse.ok(result, 'Search completed successfully').send(res)
    } catch (error) {
      next(error)
    }
  }
}
