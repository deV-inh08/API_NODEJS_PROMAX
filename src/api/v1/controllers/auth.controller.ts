import type { Request, Response, NextFunction } from 'express'
import { AuthService } from '~/api/v1/services/auth.service'
import { SuccessResponse } from '~/api/v1/utils/response.util'
import { loginZodType, registerZodType } from '~/api/v1/validations/auth.validation'

// route -> validate (zod) -> middleware (rate-limit) -> controller -> Services (DB) -> Models (declare schema)
export class AuthController {
  private authServices: AuthService
  constructor() {
    this.authServices = new AuthService()
  }

  register = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user: registerZodType = req.body
      const deviceInfo = {
        userAgent: req.headers['user-agent'],
        ip: req.ip || req.connection.remoteAddress
      }
      const result = await this.authServices.register(user, deviceInfo)
      const successResponse = SuccessResponse.created(result, 'User register successfully')
      successResponse.send(res)
    } catch (error) {
      next(error)
    }
  }

  login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const loginBody: loginZodType = req.body
      const deviceInfo = {
        userAgent: req.headers['user-agent'],
        ip: req.ip || req.connection.remoteAddress
      }
      const result = await this.authServices.login(loginBody, deviceInfo)
      const successResponse = SuccessResponse.ok(result, 'User login successfully')
      successResponse.send(res)
    } catch (error) {
      next(error)
    }
  }
}
