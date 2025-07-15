import twilio from 'twilio'
import envConfig from '~/api/v1/config/env.config'

export class SMSServices {
  private static client: twilio.Twilio | null = null
  private static fromNumber: string

  // Initialize Twilio client
  private static initializeClient() {
    if (!this.client) {
      try {
        this.client = twilio(
          envConfig.TWILIO_ACCOUNT_SID,
          envConfig.TWILIO_AUTH_TOKEN
        )
        this.fromNumber = envConfig.TWILIO_PHONE_NUMBER
        console.log('📱 Twilio SMS service initialized successfully')
      } catch (error) {
        console.error('❌ Failed to initialize Twilio client:', error)
        throw new Error('SMS service initialization failed')
      }
    }
  }


  // Send OTP SMS
  static async sendOTP(phoneNumber: string, otp: string, shopName?: string): Promise<{
    success: boolean
    messageId?: string
    error?: string
  }> {
    try {
      // Initialize client if not already done
      this.initializeClient()

      if (!this.client) {
        throw new Error('Twilio client not initialized')
      }

      // Format message
      const message = this.formatOTPMessage(otp, shopName)

      // Send SMS
      const result = await this.client.messages.create({
        body: message,
        from: this.fromNumber,
        to: phoneNumber
      })

      console.log(`✅ SMS sent successfully to ${phoneNumber}, SID: ${result.sid}`)

      return {
        success: true,
        messageId: result.sid
      }

    } catch (error: any) {
      console.error('❌ Failed to send SMS:', error)

      return {
        success: false,
        error: this.handleTwilioError(error)
      }
    }
  }
  // Format OTP message for shop verification
  private static formatOTPMessage(otp: string, shopName?: string): string {
    if (shopName) {
      return `Your business verification code for "${shopName}" is: ${otp}\n\nThis code will expire in 10 minutes.\n\nUse this code to verify your business phone number for seller registration.\n\nIf you didn't request this, please ignore this message.\n\n- TechShop Team`
    }

    return `Your verification code is: ${otp}\n\nThis code will expire in 10 minutes.\n\nIf you didn't request this, please ignore this message.\n\n- TechShop Team`
  }

  // Handle Twilio-specific errors
  private static handleTwilioError(error: any): string {
    if (error.code) {
      switch (error.code) {
        case 21211:
          return 'Invalid phone number format'
        case 21612:
          return 'Phone number is not a valid mobile number'
        case 21614:
          return 'Phone number is not a valid number'
        case 21408:
          return 'Permission denied to send SMS to this number'
        case 30007:
          return 'Message delivery failed'
        case 30008:
          return 'Message delivery unknown status'
        case 21610:
          return 'Message was filtered by carrier'
        default:
          return `SMS service error: ${error.message || 'Unknown error'}`
      }
    }

    return error.message || 'Failed to send SMS'
  }
}