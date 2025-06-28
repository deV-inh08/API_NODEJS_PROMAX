import jwt from 'jsonwebtoken'
import envConfig from '~/api/v1/config/env.config'
import { JWTPayload } from '~/api/v1/types/jwt.type'
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

  // decoded Token for check validation
  static decodedToken(token: string) {
    try {
      return jwt.decode(token)
    } catch (error) {
      return null
    }
  }

  // Get token expired time
  static getTokenExpired(token: string): Date | null {
    try {
      const decoded = jwt.decode(token) as JWTPayload
      if (decoded && decoded.exp) {
        return new Date(decoded.exp * 1000)
      }
      return null
    } catch (error) {
      return null
    }
  }

  // Check Token is expired
  static isTokenExpired(token: string): boolean {
    const isExpired = this.getTokenExpired(token)
    if (!isExpired) return true // Nếu isExpired là null -> không có token -> luôn luôn trả về True -> đã hết hạn
    return isExpired < new Date()
  }

  // validate JWT format => header.payload.signature
  static validateJWTFormat(token: string): boolean {
    const sliptTokens = token.split('.')
    return sliptTokens.length === 3 && sliptTokens.every((part) => part.length > 0)
  }
}
