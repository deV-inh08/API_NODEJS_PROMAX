import type { Request, Response, NextFunction } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { DiscountServices } from '~/api/v1/services/discount.service'
import { SuccessResponse, UnauthorizedError } from '~/api/v1/utils/response.util'
import { createDiscountZodType, updateDiscountZodType } from '~/api/v1/validations/discount.validation'
export class DiscountController {
  private discountServices: DiscountServices
  constructor() {
    this.discountServices = new DiscountServices()
  }

  createDiscount = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const decodedAT = req.decoded_accessToken
      const body: createDiscountZodType = req.body
      if (!decodedAT) {
        throw new UnauthorizedError('AccessToken is expired, please login again')
      }
      const user_id = decodedAT.id
      const result = await this.discountServices.createDiscount(body, user_id)
      const successResponse = SuccessResponse.created(result, 'create discount is successfully')
      successResponse.send(res)
    } catch (error) {
      next(error)
    }
  }

  updateDiscount = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const decodedAT = req.decoded_accessToken
      if (!decodedAT) {
        throw new UnauthorizedError('AccessToken is expired')
      }
      const userId = decodedAT.id
      const { discountId } = req.params
      const body: updateDiscountZodType = req.body
      const result = await this.discountServices.updateDiscount(body, userId, discountId)
      const successResponse = SuccessResponse.ok(result, 'update discount successfully')
      successResponse.send(res)
    } catch (error) {
      next(error)
    }
  }

  getAllProductWithDiscountCode = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { discountCode } = req.params
      const decodedAT = req.decoded_accessToken
      if (!decodedAT) {
        throw new UnauthorizedError('Accesstoken is expired. Please login by role shop')
      }
      const userId = decodedAT.id
      const result = await this.discountServices.getAllProductWithDiscountCode(discountCode, userId)
      const successResponse = SuccessResponse.ok(result, 'get list products by discount_code successfully')
      successResponse.send(res)
    } catch (error) {
      next(error)
    }
  }

  getListDiscountByShop = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const decodedAT = req.decoded_accessToken
      if (!decodedAT) {
        throw new UnauthorizedError('AccessToken is expired')
      }
      const userId = decodedAT.id
      const result = await this.discountServices.getListDiscountByShop(userId)
      const successResponse = SuccessResponse.ok(result, 'get list discounts successfully')
      successResponse.send(res)
    } catch (error) {
      next(error)
    }
  }
}
