// __tests__/helpers/test-helper.ts
import { getUserModel, getRefreshTokenModel } from '../models/simple-model'
import { Role } from '~/api/v1/types/comon.types'
import { registerZodType } from '~/api/v1/validations/auth.validation'
import { JWTServices } from '~/api/v1/utils/jwt.util'
import { BcryptServices } from '~/api/v1/utils/bcrypt.util'
import { app } from '~/index'

export class TestHelper {
  // Create test user directly in memory
  static async createTestUser(userData: registerZodType) {
    const UserModel = getUserModel()
    const hashedPassword = await BcryptServices.hashPassword(userData.password)

    const user = new UserModel({
      ...userData,
      password: hashedPassword
    })

    return await user.save()
  }

  // Create refresh token in memory
  static async createRefreshToken(userId: string, token: string) {
    const RefreshTokenModel = getRefreshTokenModel()

    const now = new Date()
    const expiresAt = new Date(now)
    expiresAt.setDate(now.getDate() + 30)

    const refreshToken = new RefreshTokenModel({
      userId,
      token,
      iat: now,
      exp: expiresAt,
      isActive: true
    })

    return await refreshToken.save()
  }

  // Generate test tokens
  static generateToken(userId: string, email: string, role: Role = 'customer') {
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

  // Get app instance
  static getApp() {
    return app
  }

  // Validate JWT token
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

  // Helper to get database stats (for debugging)
  static async getDatabaseStats() {
    const UserModel = getUserModel()
    const RefreshTokenModel = getRefreshTokenModel()

    const userCount = await UserModel.countDocuments()
    const tokenCount = await RefreshTokenModel.countDocuments()

    return {
      users: userCount,
      refreshTokens: tokenCount,
      isMemory: true
    }
  }
}
