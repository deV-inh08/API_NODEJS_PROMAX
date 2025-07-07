import { UserRepository } from '~/api/v1/repositories/user.repository'
import { changePasswordZodType, loginZodType, registerZodType } from '~/api/v1/validations/auth.validation'
import { BcryptServices } from '~/api/v1/utils/bcrypt.util'
import { JWTServices } from '~/api/v1/utils/jwt.util'
import { ConflictError, UnauthorizedError } from '~/api/v1/utils/response.util'
import { UserMessage } from '~/api/v1/constants/messages.constant'
import { RefreshTokenRepository } from '~/api/v1/repositories/refreshToken.repository'
import { IDeviceInfo } from '~/api/v1/types/auth.type'
import { refreshTokenZodType } from '~/api/v1/validations/token.validation'
import { TokenCleanUpScheduler } from '~/api/v1/repositories/refreshToken.repository'
import { JWTPayload } from '~/api/v1/types/jwt.type'
import { convertObjectIdToString } from '~/api/v1/utils/common.util'
import mongoose from 'mongoose'

export class AuthService {
  private userRepository: UserRepository
  private refreshTokenRepository: RefreshTokenRepository
  private tokenCleanUpScheduler: TokenCleanUpScheduler

  constructor() {
    this.userRepository = new UserRepository()
    this.refreshTokenRepository = new RefreshTokenRepository()
    this.tokenCleanUpScheduler = new TokenCleanUpScheduler()

    // Run cleanUp Weekly after Auth services running
    this.tokenCleanUpScheduler.startWeeklyCleanup()
  }

  getDateForToken() {
    const now = new Date()
    const expiresAt = new Date(now)
    expiresAt.setDate(now.getDate() + 30) // 30 days
    return {
      iat: now,
      exp: expiresAt
    }
  }

  // register new User
  async register(user: registerZodType, deviceInfo?: IDeviceInfo) {
    // check if user exists (chưa làm)
    const userIsExists = await this.userRepository.checkUserIsExists(user.email)
    if (userIsExists) {
      throw new ConflictError(UserMessage.EMAIL_ALREADY_EXISTS)
    }

    // hash password
    const hashPassword = await BcryptServices.hashPassword(user.password)

    // create new user
    const newUser = await this.userRepository.registerUser({
      ...user,
      password: hashPassword
    })

    const userId = newUser.id.toString()

    // generate token
    const accessToken = JWTServices.generateAccessToken({
      id: userId,
      email: newUser.email,
      role: newUser.role
    })

    const refreshToken = JWTServices.generateRefreshToken({
      id: userId
    })

    // get time
    const { iat, exp } = this.getDateForToken()

    // save refreshToken in DB
    await this.refreshTokenRepository.saveRefreshtoken({
      userId: userId,
      token: refreshToken,
      deviceInfo,
      exp,
      iat
    })

    // Return user without sensitive data
    const userResponse = {
      id: userId,
      email: newUser.email,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      phoneNumber: newUser.phoneNumber,
      dateOfBirth: newUser.dateOfBirth,
      gender: newUser.gender,
      avatar: newUser.avatar,
      isEmailVerified: newUser.isEmailVerified,
      status: newUser.status,
      role: newUser.role
    }

    return {
      user: userResponse,
      tokens: {
        accessToken,
        refreshToken
      }
    }
  }

  // login
  async login(loginBody: loginZodType, deviceInfo?: IDeviceInfo) {
    // find user by email
    const userIsExits = await this.userRepository.checkUserIsExists(loginBody.email)
    if (!userIsExits) {
      throw new UnauthorizedError('Invalid credentials')
    }

    // verify password
    const isValidPassword = await BcryptServices.comparePassword(loginBody.password, userIsExits.password)
    if (!isValidPassword) {
      throw new UnauthorizedError('Invalid credentials')
    }

    const userId = convertObjectIdToString(userIsExits.id)

    // generate token
    const accessToken = JWTServices.generateAccessToken({
      id: userId,
      email: userIsExits.email,
      role: userIsExits.role
    })
    const refreshToken = JWTServices.generateRefreshToken({
      id: userId
    })

    // save refreshToken in DB
    const { iat, exp } = this.getDateForToken()

    await this.refreshTokenRepository.saveRefreshtoken({
      userId: userId,
      token: refreshToken,
      iat,
      exp,
      deviceInfo
    })

    // Apply token limmit after save token
    await this.refreshTokenRepository.limitUserTokens(userId)

    // Return response without sensitive data
    const userResponse = {
      id: userIsExits.id,
      email: userIsExits.email,
      firstName: userIsExits.firstName,
      lastName: userIsExits.lastName,
      role: userIsExits.role,
      status: userIsExits.status,
      isEmailVerified: userIsExits.isEmailVerified
    }

    return {
      user: userResponse,
      tokens: {
        accessToken,
        refreshToken
      }
    }
  }

  // refreshToken
  async refreshToken(refreshTokenData: refreshTokenZodType, accessToken?: string, deviceInfo?: IDeviceInfo) {
    const { refreshToken } = refreshTokenData
    try {
      const decodedRT = JWTServices.verifyRefreshToken(refreshToken)

      let userFromAT = null
      let isProactiveRefresh = false

      // AccessToken còn hạn (proactive)
      if (accessToken) {
        try {
          const decodedAT = JWTServices.verifyAccessToken(accessToken)
          if (decodedRT.id === decodedAT.id) {
            userFromAT = decodedAT
            isProactiveRefresh = true
            console.log('🟢 Proactive refresh: AT still valid, refreshing early')
          } else {
            console.warn('⚠️ Token mismatch: AT and RT belong to different users')
          }
        } catch (error) {
          // AT invalid/expired → fallback to reactive
          console.log('🔴 AT provided but invalid, falling back to reactive refresh')
        }
      }

      // check RT còn active không
      const storedToken = await this.refreshTokenRepository.findActiveToken(decodedRT.id, refreshToken)
      if (!storedToken) {
        throw new UnauthorizedError('Refresh token not found or expired')
      }

      // check user có tồn tại không
      const user = await this.userRepository.getUserById(decodedRT.id)

      if (!user) {
        throw new UnauthorizedError('User not found')
      }

      //  user don't active
      if (user.status !== 'active') {
        throw new UnauthorizedError(`Account is ${user.status}`)
      }

      console.log('userFromAT', userFromAT?.role);
      console.log('user', user.role);

      // STEP 5: Additional security checks for proactive refresh
      if (isProactiveRefresh && userFromAT) {
        // Ensure user info consistency between AT and database
        if (userFromAT.role !== user.role) {
          console.warn('🚨 Role mismatch detected, forcing reactive refresh')
          isProactiveRefresh = false
        }
      }

      const userId = convertObjectIdToString(user._id)

      console.log('userId', userId);
      // STEP 6: Generate New Access Token
      const newAccessToken = JWTServices.generateAccessToken({
        id: userId,
        email: user.email,
        role: user.role
      })

      // Return response without sensitive data
      const userResponse = {
        id: userId,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        status: user.status,
        isEmailVerified: user.isEmailVerified
      }

      return {
        user: userResponse,
        tokens: {
          accessToken: newAccessToken,
          refreshToken
        },
        refreshType: isProactiveRefresh ? 'proactive' : 'reactive'
      }
    } catch (error) {
      if (error instanceof UnauthorizedError) {
        throw error
      }
      throw new UnauthorizedError('Token refresh failed', error)
    }
  }

  // logout
  async logout(decodedAT: JWTPayload, refreshToken: string) {
    // verify RT (bắt buộc phải còn valid)
    const verifyRT = JWTServices.verifyRefreshToken(refreshToken)

    // AT & RT phải cùng thuộc về 1 user
    if (decodedAT.id !== verifyRT.id) {
      throw new UnauthorizedError('Token mismatch - AT and RT belong to different users')
    }

    // Xem Rt có tồn tại trong DB không
    const storedToken = await this.refreshTokenRepository.findActiveToken(verifyRT.id, refreshToken)
    if (!storedToken) {
      throw new UnauthorizedError('Refresh token not found or already expired')
    }

    // Set RT isActive = 'false'
    const tokenId = convertObjectIdToString(storedToken._id)

    await this.refreshTokenRepository.deactiveTokenById(tokenId)
    return {
      message: 'Logout user success'
    }
  }

  // change password
  async changePassword(changePasswordBody: changePasswordZodType, decodedAT: JWTPayload, deviceInfo?: IDeviceInfo) {
    const { currentPassword, newPassword } = changePasswordBody
    // const user = await this.userRepository.getUserById(decodedAT.id)
    const user = await this.userRepository.getUserByIdWithPassword(decodedAT.id)

    if (!user || user.status !== 'active') {
      throw new UnauthorizedError('User account is not active')
    }

    console.log('user', user);
    // check current == user.password in DB
    const isValidCurrentPassword = await BcryptServices.comparePassword(currentPassword, user.password)

    if (!isValidCurrentPassword) {
      throw new UnauthorizedError('Current password is incorrect')
    }

    // hash newPassword
    const hashNewPassword = await BcryptServices.hashPassword(newPassword)

    // **** Transaction DB **** //

    // create workspace to work
    const session = await mongoose.startSession()
    session.startTransaction()

    try {
      // Work in workspace (don't save)

      // update password in DB
      await this.userRepository.updatePassword(
        decodedAT.id,
        {
          password: hashNewPassword,
          passwordChangeAt: new Date()
        },
        { session }
      )

      // logout all devices
      await this.refreshTokenRepository.invalidAllUsersToken(decodedAT.id, { session })

      // generate new Token
      const newTokens = JWTServices.generateTokens(user)

      const userId = convertObjectIdToString(user._id)

      // save new RT in DB
      const { iat, exp } = this.getDateForToken()
      await this.refreshTokenRepository.saveRefreshtoken(
        {
          userId: userId,
          token: newTokens.refreshToken,
          iat,
          exp,
          deviceInfo
        },
        { session }
      )

      session.commitTransaction()
      return {
        message: 'Password changed successfully',
        tokens: newTokens
      }
    } catch (error) {
      await session.abortTransaction()
      throw error
    } finally {
      session.endSession()
    }
  }
}
