import type { Request, Response, NextFunction } from 'express'
import { UserRepository } from '~/api/v1/repositories/user.repository'
import { JWTServices } from '~/api/v1/utils/jwt.util'
import { UnauthorizedError } from '~/api/v1/utils/response.util'
import type { ParamsDictionary } from '../../../../node_modules/@types/express-serve-static-core/index'
import { JWTPayload } from '~/api/v1/types/jwt.type'
import { Role } from '~/api/v1/types/comon.types'
import { convertObjectIdToString } from '~/api/v1/utils/common.util'
import mongoose from 'mongoose'

export class AuthMiddleWare {
  private userRepository: UserRepository
  constructor() {
    this.userRepository = new UserRepository()
  }

  // verify accessToken
  verifyAT = async (req: Request<ParamsDictionary, any, JWTPayload>, res: Response, next: NextFunction) => {
    try {
      const authHeader = req.headers.authorization // Bearer dasdsadsadas
      if (!authHeader) {
        throw new UnauthorizedError('authorization is undefined')
      }

      // split token => Bearer acxansndue
      const accessToken = authHeader.split(' ')[1]

      // decoded AT
      const decodedAT = JWTServices.verifyAccessToken(accessToken)

      const user = await this.userRepository.getUserById(decodedAT.id)

      // if don't have user
      if (!user) {
        throw new UnauthorizedError('User not found')
      }

      if (user.status !== 'active') {
        throw new UnauthorizedError('User account is not active')
      }

      const userId = convertObjectIdToString(user._id as mongoose.Types.ObjectId)

      // Attach user info to request
      req.decoded_accessToken = {
        id: userId,
        email: user.email,
        role: user.role
      }
      next()
    } catch (error) {
      next(error)
    }
  }

  // require role
  requireRole = (roles: Role[]) => (req: Request, res: Response, next: NextFunction) => {
    try {
      const decodedAT = req.decoded_accessToken
      if (!decodedAT) {
        throw new UnauthorizedError('decoded_accessToken not found')
      }
      const role = decodedAT.role as Role
      if (!roles.includes(role)) {
        throw new UnauthorizedError('Insufficient permissions')
      }
      next()
    } catch (error) {
      next(error)
    }
  }
}
