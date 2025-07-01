import type { Request, Response, NextFunction } from 'express'
import { UserRepository } from "~/api/v1/repositories/user.repository";
import { JWTServices } from '~/api/v1/utils/jwt.util';
import { UnauthorizedError } from '~/api/v1/utils/response.util';
import type { ParamsDictionary } from '../../../../node_modules/@types/express-serve-static-core/index'
import { JWTPayload } from '~/api/v1/types/jwt.type';

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
      if (!user || user.status !== 'active') {
        throw new UnauthorizedError('User account is not active')
      }

      // Attach user info to request
      req.decoded_accessToken = {
        id: user.id,
        email: user.email,
        role: user.role
      }
      next()
    } catch (error) {
      next(error)
    }
  }
}
