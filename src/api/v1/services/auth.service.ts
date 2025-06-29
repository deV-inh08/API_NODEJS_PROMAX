import { UserRepository } from '~/api/v1/repositories/user.repository'
import { loginZodType, registerZodType } from '~/api/v1/validations/auth.validation'
import { BcryptServices } from '~/api/v1/utils/bcrypt.util'
import { JWTServices } from '~/api/v1/utils/jwt.util'
import { ConflictError, UnauthorizedError } from '~/api/v1/utils/response.util'
import { UserMessage } from '~/api/v1/constants/messages.constant'
import { RefreshTokenRepository } from '~/api/v1/repositories/refreshToken.repository'
import { IDeviceInfo } from '~/api/v1/types/auth.type'
import { refreshTokenZodType } from '~/api/v1/validations/token.validation'
import { TokenCleanUpScheduler } from '~/api/v1/repositories/refreshToken.repository'

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

    // generate token
    const accessToken = JWTServices.generateAccessToken({
      id: newUser.id,
      email: newUser.email,
      role: newUser.role
    })

    const refreshToken = JWTServices.generateRefreshToken({
      id: newUser.id
    })

    // get time
    const { iat, exp } = this.getDateForToken()

    // save refreshToken in DB
    await this.refreshTokenRepository.saveRefreshtoken({
      userId: newUser.id,
      token: refreshToken,
      deviceInfo,
      exp,
      iat
    })

    // Return user without sensitive data
    const userResponse = {
      _id: newUser.id,
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

    // Apply token limmit before genare new Token
    await this.refreshTokenRepository.limitUserTokens(userIsExits.id)

    // generate token
    const accessToken = JWTServices.generateAccessToken({
      id: userIsExits.id,
      email: userIsExits.email,
      role: userIsExits.role
    })
    const refreshToken = JWTServices.generateRefreshToken({
      id: userIsExits.id
    })

    // save refreshToken in DB
    const { iat, exp } = this.getDateForToken()

    await this.refreshTokenRepository.saveRefreshtoken({
      userId: userIsExits.id,
      token: refreshToken,
      iat,
      exp,
      deviceInfo
    })

    // Return response without sensitive data
    const userResponse = {
      _id: userIsExits.id,
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
    console.log(refreshToken);
    try {
      const decodedRT = JWTServices.verifyRefreshToken(refreshToken)

      let userFromAT = null
      let isProactiveRefresh = false
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
      } else {
        console.log('🔴 Reactive refresh: No AT provided (likely expired)')
      }


      // check token còn active không
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

      // STEP 5: Additional security checks for proactive refresh
      if (isProactiveRefresh && userFromAT) {
        // Ensure user info consistency between AT and database
        if (userFromAT.role !== user.role) {
          console.warn('🚨 Role mismatch detected, forcing reactive refresh')
          isProactiveRefresh = false
        }
      }

      // Apply token limmit before genare new Token
      await this.refreshTokenRepository.limitUserTokens(user.id)

      // STEP 6: Generate New Access Token
      const newAccessToken = JWTServices.generateAccessToken({
        id: user.id,
        email: user.email,
        role: user.role
      })

      // Return response without sensitive data
      const userResponse = {
        _id: user.id,
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
        refreshType: isProactiveRefresh ? 'proactive' : 'reactive',
      }

    } catch (error) {
      if (error instanceof UnauthorizedError) {
        throw error
      }
      throw new UnauthorizedError('Token refresh failed', error)
    }

  }
}
