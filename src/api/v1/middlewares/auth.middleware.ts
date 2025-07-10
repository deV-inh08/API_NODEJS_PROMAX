import type { Request, Response, NextFunction } from 'express'
import { UserRepository } from '~/api/v1/repositories/user.repository'
import { JWTServices } from '~/api/v1/utils/jwt.util'
import { UnauthorizedError } from '~/api/v1/utils/response.util'
import type { ParamsDictionary } from '../../../../node_modules/@types/express-serve-static-core/index'
import { JWTPayload } from '~/api/v1/types/jwt.type'
import { Role } from '~/api/v1/types/comon.types'
import { convertObjectIdToString } from '~/api/v1/utils/common.util'
import mongoose from 'mongoose'
import { TokenBlacklistRepository } from '~/api/v1/repositories/tokenBlacklist.repository'

export class AuthMiddleWare {
  private userRepository: UserRepository
  private tokenBlackListRepository: TokenBlacklistRepository
  constructor() {
    this.userRepository = new UserRepository()
    this.tokenBlackListRepository = new TokenBlacklistRepository()
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

      // check AT có trong BList k
      const isBlackListed = await this.tokenBlackListRepository.isBlackListModel(accessToken)

      if (isBlackListed) {
        console.log('❌ Token found in blacklist!')
        throw new UnauthorizedError('Token has been invalidated. Please login again')
      }

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
      req.originalAccessToken = accessToken
      next()
    } catch (error) {
      next(error)
    }
  }

  // // verify AT with BlackList
  // verifyATSecure = async (req: Request<ParamsDictionary, any, JWTPayload>, res: Response, next: NextFunction) => {
  //   try {
  //     const authHeader = req.headers.authorization // Bearer dasdsadsadas

  //     if (!authHeader) {
  //       throw new UnauthorizedError('authorization is undefined')
  //     }
  //     // split token => Bearer acxansndue
  //     const accessToken = authHeader.split(' ')[1]

  //     // Check AT còn hạn hay không
  //     const checkExpiredAT = JWTServices.isTokenExpired(accessToken)

  //     // AT hết hạn
  //     if (!checkExpiredAT) {
  //       throw new UnauthorizedError('AccessToken is expired')
  //     }

  //     // AT còn hạn -> BlackList

  //   } catch (error) {
  //     next(error)
  //   }
  // }

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
