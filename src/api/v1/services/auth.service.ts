import { UserRepository } from '~/api/v1/repositories/user.repository'
import { loginZodType, registerZodType } from '~/api/v1/validations/auth.validation'
import { BcryptServices } from '~/api/v1/utils/bcrypt.util'
import { JWTServices } from '~/api/v1/utils/jwt.util'
import { ConflictError, UnauthorizedError } from '~/api/v1/utils/response.util'
import { UserMessage } from '~/api/v1/constants/messages.constant'
import { RefreshTokenRepository } from '~/api/v1/repositories/refreshToken.repository'

export class AuthService {
  private userRepository: UserRepository
  private refreshTokenRepository: RefreshTokenRepository

  constructor() {
    this.userRepository = new UserRepository()
    this.refreshTokenRepository = new RefreshTokenRepository()
  }

  // register new User
  async register(user: registerZodType) {
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
  async login(loginBody: loginZodType, deviceInfo?: any) {
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
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 30) // 30days
    await this.refreshTokenRepository.saveRefreshtoken({
      userId: userIsExits.id,
      token: refreshToken,
      expiresAt,
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
}
