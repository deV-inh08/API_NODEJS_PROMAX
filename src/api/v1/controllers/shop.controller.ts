import type { Request, Response, NextFunction } from 'express'
import { ShopServices } from '~/api/v1/services/shop.service'
import { SuccessResponse } from '~/api/v1/utils/response.util'
import { shopRegistrationZodType, verifyEmailZodType } from '~/api/v1/validations/shop.validation'

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
    const body: verifyEmailZodType = req.body
    const decodedAT = req.decoded_accessToken!
    const userId = decodedAT.id
  }

  // // ✅ Step 1: Initiate shop upgrade (send dual OTP)
  // initiateShopUpgrade = async (req: Request, res: Response, next: NextFunction) => {
  //   try {
  //     const shopData: shopRegistrationZodType = req.body
  //     const decodedAT = req.decoded_accessToken!
  //     const userId = decodedAT.id

  //     const result = await this.shopServices.initiateShopUpgrade(userId, shopData)

  //     const successResponse = SuccessResponse.ok(result, 'Business verification codes sent successfully')
  //     successResponse.send(res)
  //   } catch (error) {
  //     next(error)
  //   }
  // }

  // // ✅ Step 2: Verify email and send phone OTP
  // verifyEmailAndSendPhoneOTP = async (req: Request, res: Response, next: NextFunction) => {
  //   try {
  //     const { sessionId, emailOTP } = req.body
  //     const decodedAT = req.decoded_accessToken!
  //     const userId = decodedAT.id

  //     const result = await this.shopServices.verifyEmailAndSendPhoneOTP(sessionId, emailOTP, userId)

  //     const successResponse = SuccessResponse.ok(result, 'Email verified! Phone verification code sent')
  //     successResponse.send(res)
  //   } catch (error) {
  //     next(error)
  //   }
  // }

  // // ✅ Step 3: Verify business contacts and create shop
  // verifyBusinessContactsAndCreateShop = async (req: Request, res: Response, next: NextFunction) => {
  //   try {
  //     const { sessionId, phoneOTP } = req.body
  //     const decodedAT = req.decoded_accessToken!
  //     const userId = decodedAT.id

  //     const result = await this.shopServices.verifyPhoneAndCreateShop(sessionId, phoneOTP, userId)

  //     const successResponse = SuccessResponse.created(result, 'Shop created successfully!')
  //     successResponse.send(res)
  //   } catch (error) {
  //     next(error)
  //   }
  // }
}
