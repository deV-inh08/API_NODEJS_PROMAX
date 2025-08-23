import type { Request, Response, NextFunction } from 'express'
import { AuthService } from '~/api/v1/services/auth.service'
import { SuccessResponse, UnauthorizedError } from '~/api/v1/utils/response.util'
import {
  changePasswordZodType,
  loginZodType,
  logoutZodType,
  registerZodType
} from '~/api/v1/validations/auth.validation'
import { refreshTokenZodType } from '~/api/v1/validations/token.validation'

// route -> validate (zod) -> middleware (rate-limit) -> controller -> Services (DB) -> Models (declare schema)
export class AuthController {
  private authServices: AuthService
  constructor() {
    this.authServices = new AuthService()
  }

  private getDeviceInfo = (req: Request) => {
    const deviceInfo = {
      userAgent: req.headers['user-agent'],
      ip: req.ip || req.connection.remoteAddress
    }
    return deviceInfo
  }

  register = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user: registerZodType = req.body
      const deviceInfo = this.getDeviceInfo(req)
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
      const deviceInfo = this.getDeviceInfo(req)

      const result = await this.authServices.login(loginBody, deviceInfo)
      const successResponse = SuccessResponse.ok(result, 'User login successfully')
      successResponse.send(res)
    } catch (error) {
      next(error)
    }
  }

  refreshToken = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const refreshTokenData: refreshTokenZodType = req.body
      const deviceInfo = this.getDeviceInfo(req)

      // Extract AccessToken from Authorization header
      const authHeader = req.headers.authorization!
      const accessToken = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : undefined

      // call auth services
      const result = await this.authServices.refreshToken(refreshTokenData, accessToken, deviceInfo)
      const successResponse = SuccessResponse.ok(result, 'Token refreshed SuccessFully')
      successResponse.send(res)
    } catch (error) {
      next(error)
    }
  }

  logout = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { refreshToken }: logoutZodType = req.body
      const accessToken = req.originalAccessToken!
      const decodedAT = req.decoded_accessToken

      if (!decodedAT) {
        throw new UnauthorizedError('Not found decodedAT')
      }

      // call auth services
      await this.authServices.logout(decodedAT, refreshToken, accessToken)
      const successResponse = SuccessResponse.ok(null, 'Logout user success')
      successResponse.send(res)
    } catch (error) {
      next(error)
    }
  }

  changePassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const changePasswordBody: changePasswordZodType = req.body
      const decodedAT = req.decoded_accessToken
      const deviceInfo = this.getDeviceInfo(req)

      if (!decodedAT) {
        throw new UnauthorizedError('Not found decodedAT')
      }

      // call auth services
      const result = await this.authServices.changePassword(changePasswordBody, decodedAT, deviceInfo)
      const successResponse = SuccessResponse.ok(result, 'Change password success')
      successResponse.send(res)
    } catch (error) {
      next(error)
    }
  }

}
