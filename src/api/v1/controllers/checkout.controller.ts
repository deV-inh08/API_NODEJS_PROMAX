import type { Response, Request, NextFunction } from 'express'
import { UnauthorizedError } from '~/api/v1/utils/response.util'
import { checkoutSchemaZodType } from '~/api/v1/validations/checkout.validation'
export class CheckoutController {
  static checkoutReview = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const decodedAT = req.decoded_accessToken
      const body: checkoutSchemaZodType = req.body
      if (!decodedAT) {
        throw new UnauthorizedError('Access Token expired')
      }
      const user_id = decodedAT.id
    } catch (error) {
      next(error)
    }
  }
}
