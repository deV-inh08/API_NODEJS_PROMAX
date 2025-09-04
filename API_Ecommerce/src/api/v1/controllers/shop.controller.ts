import type { Request, Response, NextFunction } from 'express'
import { ShopServices } from '~/api/v1/services/shop.service'
import { SuccessResponse } from '~/api/v1/utils/response.util'
import { shopRegistrationZodType, verifyEmailZodType, verifyPhoneZodType } from '~/api/v1/validations/shop.validation'

export class ShopController {
  private shopServices: ShopServices

  constructor() {
    this.shopServices = new ShopServices()
  }

  // Register shop
  registerShop = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const shopData: shopRegistrationZodType = req.body
      const decodedAT = req.decoded_accessToken!
      const userId = decodedAT.id
      const result = await this.shopServices.registerShop(shopData, userId)
      const successResponse = SuccessResponse.ok(result, 'Business verification codes sent successfully')
      successResponse.send(res)
    } catch (error) {
      next(error)
    }
  }

  verifyEmailShop = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const body: verifyEmailZodType = req.body
      const decodedAT = req.decoded_accessToken!
      const userId = decodedAT.id
      const result = await this.shopServices.verifyEmailShop(body, userId)
      const successResponse = SuccessResponse.ok(result, 'Verify email successfully')
      successResponse.send(res)
    } catch (error) {
      next(error)
    }
  }

  verifyPhoneNumber = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const body: verifyPhoneZodType = req.body
      const decodedAT = req.decoded_accessToken!
      const userId = decodedAT.id
      const result = await this.shopServices.verifyPhoneNumberShop(body, userId)
      const successResponse = SuccessResponse.ok(result, 'Verify phone successfully')
      successResponse.send(res)
    } catch (error) {
      next(error)
    }
  }
}
