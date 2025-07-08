import { forgotPasswordZodType } from '~/api/v1/validations/auth.validation'
import { UserRepository } from '~/api/v1/repositories/user.repository'
import { BadRequestError, NotFoundError, TooManyRequest, UnauthorizedError } from '~/api/v1/utils/response.util'
import { OTP } from '~/api/v1/constants/otp.constant'
import { OTPServices } from '~/api/v1/utils/otp.util'
import { convertObjectIdToString } from '~/api/v1/utils/common.util'
import { EmailServices } from '~/api/v1/utils/email.util'

export class ForgotPasswordService {
  private userRepository: UserRepository

  constructor() {
    this.userRepository = new UserRepository()
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
    await this.userRepository.updatePasswordReset(userId, {
      passwordResetOTP: hashedOTP,
      passwordResetOTPExpires: expAt,
      passwordResetAttempts: 0,
      passwordResetLastAttempt: new Date()
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
}
