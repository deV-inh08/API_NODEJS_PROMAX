import type { Request, Response, NextFunction } from 'express'
import { ForgotPasswordService } from '~/api/v1/services/forgotPassword.service'
import { SuccessResponse } from '~/api/v1/utils/response.util'
import { forgotPasswordZodType } from '~/api/v1/validations/auth.validation'

export class ForgotPasswordController {
  private forgotPasswordServices: ForgotPasswordService

  constructor() {
    this.forgotPasswordServices = new ForgotPasswordService()
  }

  private getClientIP(req: Request): string {
    return req.ip || req.connection.remoteAddress || 'unknow'
  }

  // Request OTP
  requestOTP = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data: forgotPasswordZodType = req.body
      const clientIP = this.getClientIP(req)

      const result = await this.forgotPasswordServices.requestPasswordReset(data)
      const successResponse = SuccessResponse.ok(result, 'OTP sent successfully')
      successResponse.send(res)
    } catch (error) {
      next(error)
    }
  }
}
