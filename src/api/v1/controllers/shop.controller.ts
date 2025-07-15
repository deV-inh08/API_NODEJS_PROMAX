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
  // registerSeller = async (req: Request, res: Response, next: NextFunction) => {
  //   try {
  //     const shopBody: shopRegistrationZodType = req.body
  //     const decodedAT = req.decoded_accessToken!
  //     const userId = decodedAT.id
  //     const result = await this.shopServices.registerShop(userId, shopBody)
  //     const successResponse = SuccessResponse.created(result, 'Seller registration successful. Your shop is active')
  //     successResponse.send(res)
  //   } catch (error) {
  //     next(error)
  //   }
  // }

  // ✅ Step 1: Initiate shop upgrade (send dual OTP)
  initiateShopUpgrade = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const shopData: shopRegistrationZodType = req.body
      const decodedAT = req.decoded_accessToken!
      const userId = decodedAT.id

      const result = await this.shopServices.initiateShopUpgrade(userId, shopData)

      const successResponse = SuccessResponse.ok(result, 'Business verification codes sent successfully')
      successResponse.send(res)
    } catch (error) {
      next(error)
    }
  }

  // ✅ Step 2: Verify business contacts and create shop
  verifyBusinessContactsAndCreateShop = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { sessionId, phoneOTP } = req.body
      const decodedAT = req.decoded_accessToken!
      const userId = decodedAT.id

      const result = await this.shopServices.verifyPhoneAndCreateShop(
        sessionId,
        phoneOTP,
        userId
      )

      const successResponse = SuccessResponse.created(result, 'Shop created successfully!')
      successResponse.send(res)
    } catch (error) {
      next(error)
    }
  }
}
