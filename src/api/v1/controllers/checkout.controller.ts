import type { Response, Request, NextFunction } from 'express'
import { SuccessResponse, UnauthorizedError } from '~/api/v1/utils/response.util'
import { checkoutSchemaZodType } from '~/api/v1/validations/checkout.validation'
import { CheckoutService } from '~/api/v1/services/checkout.service'
export class CheckoutController {
  private checkoutService: CheckoutService

  constructor() {
    this.checkoutService = new CheckoutService()
  }
  checkoutReview = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const decodedAT = req.decoded_accessToken
      const body: checkoutSchemaZodType = req.body
      if (!decodedAT) {
        throw new UnauthorizedError('Access Token expired')
      }
      const user_id = decodedAT.id
      const result = await this.checkoutService.checkoutReview(user_id, body)
      SuccessResponse.ok(result, 'check out preview succesfully').send(res)
    } catch (error) {
      next(error)
    }
  }
}
