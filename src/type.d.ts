import { Request } from 'express'
import { JWTPayload } from '~/api/v1/types/jwt.type'
declare module 'express' {
  interface Request {
    decoded_accessToken?: JWTPayload
    originalAccessToken?: string
  }
}
