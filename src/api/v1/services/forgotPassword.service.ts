import { forgotPasswordZodType, resetPasswordZodType, verifyOTPZodType } from '~/api/v1/validations/auth.validation'
import { UserRepository } from '~/api/v1/repositories/user.repository'
import { BadRequestError, NotFoundError, TooManyRequest, UnauthorizedError } from '~/api/v1/utils/response.util'
import { OTP } from '~/api/v1/constants/otp.constant'
import { OTPServices } from '~/api/v1/utils/otp.util'
import { convertObjectIdToString } from '~/api/v1/utils/common.util'
import { EmailServices } from '~/api/v1/utils/email.util'
import { BcryptServices } from '~/api/v1/utils/bcrypt.util'
import { RefreshTokenRepository } from '~/api/v1/repositories/refreshToken.repository'

export class ForgotPasswordService {
  private userRepository: UserRepository
  private refreshTokenRepository: RefreshTokenRepository

  constructor() {
    this.userRepository = new UserRepository()
    this.refreshTokenRepository = new RefreshTokenRepository()
  }

  // Nhận request OTP -> body {email : string}
  async requestPasswordReset(data: forgotPasswordZodType) {
    const { email } = data

    // check user is exists with email
    const user = await this.userRepository.checkUserIsExists(email)

    if (!user) {
      throw new NotFoundError('User is not exists')
    }

    // check if account locked -> Khi sai OTP 5 attempts
    if (user.accountLockUntils && user.accountLockUntils > new Date()) {
      const lockedTime = Math.ceil((user.accountLockUntils.getTime() - Date.now()) / 60000)
      throw new TooManyRequest(`Account locked. Try again in ${lockedTime} minutes`)
    }

    // Rate limit request OTP
    if (user.passwordResetLastAttempts) {
      const timeLastRequest = Date.now() - user.passwordResetLastAttempts.getTime() // Hiện tại - thời gian cập nhật password ở quá khứ

      if (timeLastRequest < OTP.RATE_LIMIT_TIME) {
        const waitingTime = Math.ceil((OTP.RATE_LIMIT_TIME - timeLastRequest) / 1000)
        throw new TooManyRequest(`Please wait ${waitingTime} seconds before request again`)
      }
    }
    // generat OTP
    const otp = OTPServices.generateOTP()
    const hashedOTP = await OTPServices.hashOTP(otp)
    const expAt = new Date(Date.now() + OTP.OTP_EXPIRY)

    const userId = convertObjectIdToString(user._id)
    // save OTP in DB
    await this.userRepository.updatePasswordResetOTP(userId, {
      passwordResetOTP: hashedOTP,
      passwordResetOTPExpires: expAt,
      passwordResetAttempts: 0,
      passwordResetLastAttempt: new Date(),
      isOTPVerified: false
    })

    // send OTP email
    const emailSent = await EmailServices.sendOTPEmail(email, otp)

    if (!emailSent) {
      throw new BadRequestError('Failed to send OTP email')
    }

    return {
      message: 'OTP sent to your email',
      expiresIn: OTP.OTP_EXPIRY / 60000 // minutes
    }
  }

  // Verify OTP when client send
  async verifyOTP(body: verifyOTPZodType) {
    const { email, otp } = body
    // check user is exists
    const user = await this.userRepository.checkUserIsExists(email)

    if (!user) {
      throw new NotFoundError('User not found')
    }

    const userId = convertObjectIdToString(user._id)

    // check if OTP exists
    if (!user.passwordResetOTP || !user.passwordResetOTPExpires) {
      throw new BadRequestError('No OTP request found. Please request a new OTP')
    }

    // check if OTP expired
    if (OTPServices.isOTPExpired(user.passwordResetOTPExpires)) {
      // clear OTP expired from DB
      await this.userRepository.clearPasswordResetPassword(userId)
      throw new BadRequestError('OTP is expired. Please request a new OTP')
    }

    // check attempts limit
    if (user.passwordResetAttempts >= OTP.MAX_ATTEMPTS) {
      // lock account
      await this.userRepository.lockAccount(userId, new Date(Date.now() + OTP.LOCKOUT_TIME))
      throw new TooManyRequest('Too many failed attempts. Account locked 15 minutes')
    }

    // verify OTP
    const isValidOTP = OTPServices.verifyOTP(otp, user.passwordResetOTP)

    if (!isValidOTP) {
      // Increament failed attempts
      await this.userRepository.incrementPasswordResetAttempt(userId)

      const remainingAttempts = OTP.MAX_ATTEMPTS - (user.passwordResetAttempts + 1)
      throw new UnauthorizedError(`Invalid OTP. ${remainingAttempts} attemps remaining`)
    }

    // set isVerifyOTP in DB = true
    await this.userRepository.verifyOTP(userId)

    return {
      verified: true
    }
  }

  // reset password after verify-otp
  async resetPassword(body: resetPasswordZodType) {
    const { email, password } = body

    // check xem co user khong
    const user = await this.userRepository.checkUserIsExists(email)

    if (!user) {
      throw new NotFoundError('User not found')
    }
    const userId = convertObjectIdToString(user._id)

    // check xem OTP có tồn tại không
    if (!user.passwordResetOTP || !user.passwordResetOTPExpires) {
      throw new BadRequestError('No OTP request found. Please request a new OTP')
    }

    // check xem OTP verified chưa
    if (!user.isOTPVerified) {
      throw new BadRequestError(`OTP don't verified. Please request a new OTP and verified`)
    }

    // check OTP còn hạn không
    if (OTPServices.isOTPExpired(user.passwordResetOTPExpires)) {
      // clear OTP expired from DB
      await this.userRepository.clearPasswordResetPassword(userId)
      throw new BadRequestError('OTP is expired. Please request a new OTP')
    }

    // hash new password
    const hashPassword = await BcryptServices.hashPassword(password)

    // update new Password
    try {
      await this.userRepository.updatePassword(userId, {
        password: hashPassword,
        passwordChangeAt: new Date()
      })

      // clear all reset data
      await this.userRepository.clearPasswordResetPassword(userId)

      // logout all devices
      await this.refreshTokenRepository.invalidAllUsersToken(userId)
    } catch (error) {
      throw new BadRequestError('Failed to reset password')
    }
  }
}
