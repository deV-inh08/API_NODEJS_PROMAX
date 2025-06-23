import jwt from 'jsonwebtoken'
import envConfig from '~/api/v1/config/env.config'
import { JWTPayload } from '~/api/v1/types/jwt.type'
import type { StringValue } from "ms";
import { UnauthorizedError } from '~/api/v1/utils/response.util';
import { ErrorMessage } from '~/api/v1/constants/messages.constant';


export class JWTServices {
  private static readonly JWT_REFRESH_TOKEN_EXPIRES_IN = envConfig.JWT_REFRESH_TOKEN_EXPIRES_IN
  private static readonly JWT_ACCESS_TOKEN_EXPIRES_IN = envConfig.JWT_ACCESS_TOKEN_EXPIRES_IN
  private static readonly JWT_ACCESS_TOKEN_SECRET = envConfig.JWT_ACCESS_TOKEN_SECRET
  private static readonly JWT_REFRESH_TOKEN_SECRET = envConfig.JWT_REFRESH_TOKEN_SECRET

  // generate AccessToken
  static generateAccessToken(payload: JWTPayload) {
    return jwt.sign(payload, this.JWT_ACCESS_TOKEN_SECRET, {
      expiresIn: this.JWT_ACCESS_TOKEN_EXPIRES_IN as StringValue,
    })
  }

  // generate RefreshToken
  static generateRefreshToken(payload: Pick<JWTPayload, 'id'>) {
    return jwt.sign(payload, this.JWT_REFRESH_TOKEN_SECRET, {
      expiresIn: this.JWT_REFRESH_TOKEN_EXPIRES_IN as StringValue
    })
  }

  // verify token
  static verifyToken({ token, secretOrPublicKey }: { token: string, secretOrPublicKey: string }) {
    try {
      return jwt.sign(token, secretOrPublicKey)
    } catch (error) {
      throw new UnauthorizedError(ErrorMessage.UNAUTHORIZED, error)
    }
  }
}
