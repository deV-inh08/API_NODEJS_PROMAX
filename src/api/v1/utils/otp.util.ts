import crypto from 'crypto'

export class OTPServices {
  // generate 6 digits
  static generateOTP(): string {
    return crypto.randomInt(100000, 999999).toString()
  }

  // hash OTP
  static async hashOTP(otp: string): Promise<string> {
    return crypto.createHash('sha256').update(otp).digest('hex')
  }

  // verify OTP
  static async verifyOTP(otp: string, hashOtp: string): Promise<boolean> {
    const hashNewOtp = await this.hashOTP(otp)
    return hashNewOtp === hashOtp
  }

  // check if OTP expired
  static isOTPExpired(expOTP: Date): boolean {
    return new Date() > expOTP
  }
}
