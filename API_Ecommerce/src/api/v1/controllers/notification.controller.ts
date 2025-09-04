import type { Response, Request, NextFunction } from 'express'
import { SuccessResponse, UnauthorizedError } from '~/api/v1/utils/response.util'
import { listNotiByUser } from '~/api/v1/services/notification.service'
export class NotifiController {
  notification = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const decodedAT = req.decoded_accessToken
      if (!decodedAT) {
        throw new UnauthorizedError('Access Token expired')
      }
      const userId = decodedAT.id
      const result = await listNotiByUser('SHOP-001', userId)
      SuccessResponse.ok(result, 'Get list notification').send(res)
    } catch (error) {
      next(error)
    }
  }
}
