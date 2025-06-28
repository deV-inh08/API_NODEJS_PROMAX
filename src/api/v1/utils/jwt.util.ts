import jwt from 'jsonwebtoken'
import envConfig from '~/api/v1/config/env.config'
import { JWTExpiresPayload, JWTPayload } from '~/api/v1/types/jwt.type'
import type { StringValue } from 'ms'
import { UnauthorizedError } from '~/api/v1/utils/response.util'
import { ErrorMessage } from '~/api/v1/constants/messages.constant'

export class JWTServices {
  private static readonly JWT_REFRESH_TOKEN_EXPIRES_IN = envConfig.JWT_REFRESH_TOKEN_EXPIRES_IN
  private static readonly JWT_ACCESS_TOKEN_EXPIRES_IN = envConfig.JWT_ACCESS_TOKEN_EXPIRES_IN
  private static readonly JWT_ACCESS_TOKEN_SECRET = envConfig.JWT_ACCESS_TOKEN_SECRET
  private static readonly JWT_REFRESH_TOKEN_SECRET = envConfig.JWT_REFRESH_TOKEN_SECRET

  // generate AccessToken
  static generateAccessToken(payload: JWTPayload) {
    return jwt.sign(payload, this.JWT_ACCESS_TOKEN_SECRET, {
      expiresIn: this.JWT_ACCESS_TOKEN_EXPIRES_IN as StringValue
    })
  }

  // generate RefreshToken
  static generateRefreshToken(payload: Pick<JWTPayload, 'id'>) {
    return jwt.sign(payload, this.JWT_REFRESH_TOKEN_SECRET, {
      expiresIn: this.JWT_REFRESH_TOKEN_EXPIRES_IN as StringValue
    })
  }

  // verify Access Token
  static verifyAccessToken(accessToken: string): JWTPayload {
    try {
      const decoded = jwt.verify(accessToken, this.JWT_ACCESS_TOKEN_SECRET) as JWTPayload
      return decoded
    } catch (error: any) {
      if (error.name === 'TokenExpiredError') {
        throw new UnauthorizedError('Access Token expired')
      } else if (error.name === 'JsonWebTokenError') {
        throw new UnauthorizedError('Invalid Access Token')
      } else if (error.name === 'NotBeforeError') {
        throw new UnauthorizedError('Access token not active yet')
      }
      throw new UnauthorizedError('Access token verification failed')
    }
  }

  static verifyRefreshToken(refreshToken: string): Pick<JWTPayload, 'id'> {
    try {
      const decoded = jwt.verify(refreshToken, this.JWT_REFRESH_TOKEN_SECRET) as Pick<JWTPayload, 'id'>
      if (!decoded.id) {
        throw new UnauthorizedError('Invalid token payload')
      }
      return decoded
    } catch (error: any) {
      if (error.name === 'TokenExpiredError') {
        throw new UnauthorizedError('Access Token expired')
      } else if (error.name === 'JsonWebTokenError') {
        throw new UnauthorizedError('Invalid Access Token')
      } else if (error.name === 'NotBeforeError') {
        throw new UnauthorizedError('Access token not active yet')
      }
      throw new UnauthorizedError('Access token verification failed')
    }
  }


  // // Get token expired time
  // static getTokenExpired(token: string): JWTExpiresPayload {
  //   try {
  //     const decoded = jwt.decode(token) as JWTExpiresPayload
  //     if() {

  //     }
  //   } catch (error) {

  //   }
  // }
}
