import { JwtPayload } from 'jsonwebtoken'
export interface JWTPayload extends JwtPayload {
  _id: string
  email: string
  role: string
}
