import type { Request, Response, NextFunction } from 'express'
import { AuthService } from '~/api/v1/services/auth.service'
import { SuccessResponse } from '~/api/v1/utils/response.util'
import { registerZodType } from '~/api/v1/validations/auth.validation'

// route -> validate (zod) -> middleware (rate-limit) -> controller -> Services (DB) -> Models (declare schema)
export class AuthController {
  private authServices: AuthService
  constructor() {
    this.authServices = new AuthService()
  }

  register = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user: registerZodType = req.body
      const result = await this.authServices.register(user)
      const successResponse = SuccessResponse.created(result, 'User register successfully')
      successResponse.send(res)
    } catch (error) {
      next(error)
    }
  }
}