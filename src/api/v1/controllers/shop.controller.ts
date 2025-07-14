import type { Request, Response, NextFunction } from 'express'
import { ShopServices } from '~/api/v1/services/shop.service'
import { SuccessResponse } from '~/api/v1/utils/response.util'
import { shopRegistrationZodType } from '~/api/v1/validations/shop.validation'

export class ShopController {
  private shopServices: ShopServices

  constructor() {
    this.shopServices = new ShopServices()
  }

  // Regiter seller
  async registerSeller(req: Request, res: Response, next: NextFunction) {
    try {
      const shopBody: shopRegistrationZodType = req.body
      const decodedAT = req.decoded_accessToken!
      const userId = decodedAT.id
      console.log('userId', userId);
      console.log('shopBody', shopBody);
      const result = await this.shopServices.registerShop(userId, shopBody)
      const successResponse = SuccessResponse.created(result, 'Seller registration successful. Your shop is active')
      successResponse.send(res)
    } catch (error) {
      next(error)
    }
  }
}
