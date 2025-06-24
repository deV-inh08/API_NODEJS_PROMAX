import { UserRepository } from "~/api/v1/repositories/user.repository";
import { registerZodType } from "~/api/v1/validations/auth.validation";
import { BcryptServices } from "~/api/v1/utils/bcrypt.util";
import { JWTServices } from "~/api/v1/utils/jwt.util";

export class AuthService {
  private userRepository: UserRepository

  constructor() {
    this.userRepository = new UserRepository()
  }

  // register new User
  async register(user: registerZodType) {
    // check if user exists (chưa làm)

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
}