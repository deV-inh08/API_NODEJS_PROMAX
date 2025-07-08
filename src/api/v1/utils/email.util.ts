import nodemailer from 'nodemailer'
import envConfig from '~/api/v1/config/env.config'
export class EmailServices {
  private static transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: envConfig.EMAIL_ADMIN,
      pass: envConfig.EMAIL_APP_PASSWORD
    }
  })

  // sendOTP
  static async sendOTPEmail(userEmail: string, otp: string) {
    const mailOptions = {
      from: `Shop Dev <${envConfig.EMAIL_ADMIN}>`,
      to: userEmail,
      subject: 'Password Reset OTP - TechShop',
      html: `
        <h2>Password Reset Request</h2>
        <p>Hello,</p>
        <p>Your OTP for password reset is: <strong>${otp}</strong></p>
        <p>This OTP will expire in 10 minutes.</p>
        
        <hr>
        <small>
          This email was sent from TechShop system. 
          Please do not reply to this email.
        </small>
      `
    }

    try {
      await this.transporter.sendMail(mailOptions)
      console.log('Send Email Success')
      return true
    } catch (error) {
      console.log('Send Email error', error)
      return false
    }
  }
}
