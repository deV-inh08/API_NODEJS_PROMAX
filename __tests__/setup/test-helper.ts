import { UserRepository } from '../../src/api/v1/repositories/user.repository'
import { Role } from '../../src/api/v1/types/comon.types'
import { registerZodType } from '../../src/api/v1/validations/auth.validation'
import { JWTServices } from '../../src/api/v1/utils/jwt.util'
import { app } from '../../src/index'
import { BcryptServices } from '../../src/api/v1/utils/bcrypt.util'


export class TestHelper {
  private static userRepository: UserRepository = new UserRepository()

  // create test user
  static async createTestUser(userData: registerZodType) {
    const hassPassword = await BcryptServices.hashPassword(userData.password)

    return await this.userRepository.registerUser({
      ...userData,
      password: hassPassword
    })
  }

  // test generate AT & RT token
  static genarateToken(userId: string, email: string, role: Role = 'customer') {
    const accessToken = JWTServices.generateAccessToken({
      id: userId,
      email,
      role
    })

    const refreshToken = JWTServices.generateRefreshToken({
      id: userId
    })

    return {
      accessToken,
      refreshToken
    }
  }

  // get app instance
  static getApp() {
    return app
  }

  // validate JWT token
  static isValidJWT(token: string): boolean {
    return JWTServices.validateJWTFormat(token)
  }

  // Extract user ID from JWT
  static extractUserIdFromToken(token: string): string | null {
    try {
      const decoded = JWTServices.decodedToken(token)
      return decoded?.id || null
    } catch {
      return null
    }
  }
}