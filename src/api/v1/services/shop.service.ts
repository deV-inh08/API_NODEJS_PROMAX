import { ShopRepository } from '~/api/v1/repositories/shop.repository'
import { UserRepository } from '~/api/v1/repositories/user.repository'
import { convertStringToObjectId } from '~/api/v1/utils/common.util'
import { OTPServices } from '~/api/v1/utils/otp.util'
import { BadRequestError, ConflictError, NotFoundError, UnauthorizedError, ValidationError } from '~/api/v1/utils/response.util'
import { shopRegistrationZodType } from '~/api/v1/validations/shop.validation'
import { isValidPhoneNumber, parsePhoneNumber } from 'libphonenumber-js'
import { IPendingShopRegistration, IShop } from '~/api/v1/types/shop.type'
import { EmailServices } from '~/api/v1/services/email.service'
import { SMSServices } from '~/api/v1/utils/sms.util'

export class ShopServices {
  private userRepository: UserRepository
  private shopRepository: ShopRepository
  private pendingRegistrations = new Map<string, IPendingShopRegistration>()

  constructor() {
    this.shopRepository = new ShopRepository()
    this.userRepository = new UserRepository()
  }

  registerShop = async (shopData: shopRegistrationZodType, userId: string) => {
    // check shop_name is exists
    const existingShop = await this.shopRepository.findShopByName(shopData.shop_name)
    if (existingShop) {
      throw new ConflictError('Shop name already exists')
    }

    // format phone & email
    const shop_phone = this.validateAndFormatPhone(shopData.shop_phone)
    const shop_email = shopData.shop_email.toLowerCase().trim()
    const isValidEmail = this.isValidEmail(shop_email)
    if (!isValidEmail) {
      throw new ValidationError('Email is not valid')
    }

    // generate Email OTP
    const emailOTP = OTPServices.generateOTP()

    // hash email OTP
    const hashEmailOTP = await OTPServices.hashOTP(emailOTP)

    // create sessionID
    const sessionId = this.generateSessionId(userId)
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

    // create pending Data
    const pendingData: IPendingShopRegistration = {
      userId,
      shopData: {
        ...shopData,
        shop_email,
        shop_phone,
      },
      currentStep: 'email_verification',
      shop_email_OTP: {
        createAt: new Date(),
        hashOTP: hashEmailOTP,
        expired: new Date(Date.now() + 5 * 60 * 1000),
        verify: false
      },
      shop_phone_OTP: {
        createAt: new Date(),
        hashOTP: "",
        expired: new Date(),
        verify: false
      },
      createdAt: new Date(),
      expiresAt
    }

    // Store pending registration
    this.pendingRegistrations.set(sessionId, pendingData)

    //  Send EMAIL OTP
    await EmailServices.sendShopVerificationEmail(shop_email, emailOTP, shopData.shop_name)

    return {
      sessionId,
      shopData: pendingData.shopData,
      currentStep: 'email_verification',
      message: 'Email verification code sent to your business email',
    }
  }

  // send dual otp
  // async initiateShopUpgrade(userId: string, shopData: shopRegistrationZodType) {
  //   const existingShop = await this.shopRepository.findShopByName(shopData.shop_name)
  //   if (existingShop) {
  //     throw new ConflictError('Shop name already exists')
  //   }

  //   // format phone & email
  //   const formattedPhone = this.validateAndFormatPhone(shopData.shop_phone)
  //   const businessEmail = shopData.shop_email.toLowerCase().trim()
  //   const isValidEmail = this.isValidEmail(shopData.shop_email.toLowerCase().trim())
  //   if (!isValidEmail) {
  //     throw new UnauthorizedError('Email is not valid')
  //   }

  //   // generate OTP
  //   const emailOTP = OTPServices.generateOTP()

  //   //  Hash OTPs
  //   const hashedEmailOTP = await OTPServices.hashOTP(emailOTP)

  //   // Create session for EMAIL verification
  //   const sessionId = this.generateSessionId(userId)
  //   const expiresAt = new Date(Date.now() + 30 * 60 * 1000) // 30 minutes

  //   const pendingData: IPendingShopRegistration = {
  //     userId,
  //     shopData: {
  //       ...shopData,
  //       shop_email: businessEmail,
  //       shop_phone: formattedPhone
  //     },
  //     emailOTP: {
  //       code: hashedEmailOTP,
  //       expiresAt: new Date(Date.now() + 10 * 60 * 1000),
  //       verified: false,
  //       attempts: 0
  //     },
  //     phoneOTP: {
  //       code: '', // Not generated yet
  //       expiresAt: new Date(),
  //       verified: false,
  //       attempts: 0
  //     },
  //     currentStep: 'email_verification', // Track current step
  //     createdAt: new Date(),
  //     expiresAt
  //   }
  //   console.log('pendingData', pendingData)

  //   // 7. Store pending registration
  //   this.pendingRegistrations.set(sessionId, pendingData)

  //   // 8. Send EMAIL OTP only
  //   await EmailServices.sendShopVerificationEmail(businessEmail, emailOTP, shopData.shop_name)
  //   return {
  //     sessionId,
  //     message: 'Email verification code sent to your business email',
  //     expiresIn: 30,
  //     currentStep: 'email_verification',
  //     contacts: {
  //       email: businessEmail,
  //       phone: formattedPhone
  //     },
  //     nextStep: 'verify_email'
  //   }
  // }

  // // ✅ STEP 2: Verify email and send phone OTP
  // async verifyEmailAndSendPhoneOTP(sessionId: string, emailOTP: string, userId: string) {
  //   try {
  //     // 1. Get pending registration
  //     const pending = this.pendingRegistrations.get(sessionId)
  //     if (!pending || pending.userId !== userId) {
  //       throw new BadRequestError('Invalid or expired verification session')
  //     }

  //     // 2. Check if we're in the right step
  //     if (pending.currentStep !== 'email_verification') {
  //       throw new BadRequestError('Invalid verification step')
  //     }

  //     // 3. Verify email OTP
  //     const emailValid = await OTPServices.verifyOTP(emailOTP, pending.emailOTP.code)
  //     if (!emailValid) {
  //       pending.emailOTP.attempts++
  //       this.pendingRegistrations.set(sessionId, pending)
  //       throw new BadRequestError(`Invalid email OTP. ${5 - pending.emailOTP.attempts} attempts remaining.`)
  //     }

  //     // 4. Mark email as verified
  //     pending.emailOTP.verified = true
  //     pending.currentStep = 'phone_verification'

  //     // 5. Generate phone OTP
  //     const phoneOTP = OTPServices.generateOTP()
  //     const hashedPhoneOTP = await OTPServices.hashOTP(phoneOTP)

  //     pending.phoneOTP = {
  //       code: hashedPhoneOTP,
  //       expiresAt: new Date(Date.now() + 10 * 60 * 1000),
  //       verified: false,
  //       attempts: 0
  //     }

  //     // 6. Update session
  //     this.pendingRegistrations.set(sessionId, pending)

  //     // 7. Send phone OTP
  //     let sendOTPPhoneResult
  //     console.log('shop_phone', pending.shopData.shop_phone)
  //     try {
  //       sendOTPPhoneResult = await SMSServices.sendOTP(
  //         pending.shopData.shop_phone,
  //         phoneOTP,
  //         pending.shopData.shop_name
  //       )

  //       console.log('📱 SMS Result:', sendOTPPhoneResult)
  //     } catch (smsError) {
  //       console.error('❌ SMS Error:', smsError)

  //       // ✅ Mock SMS nếu gửi thật thất bại (để test tiếp)
  //       console.log('🔧 SMS failed, using mock mode for testing...')
  //       console.log(`📱 Phone OTP for ${pending.shopData.shop_phone}: ${phoneOTP}`)

  //       sendOTPPhoneResult = {
  //         success: true,
  //         messageId: `mock_after_error_${Date.now()}`
  //       }
  //     }

  //     if (!sendOTPPhoneResult.success) {
  //       throw new BadRequestError('Failed to send phone OTP. Please try again.')
  //     }

  //     return {
  //       sessionId,
  //       message: 'Email verified! Phone verification code sent',
  //       currentStep: 'phone_verification',
  //       contacts: {
  //         email: pending.shopData.shop_email,
  //         phone: pending.shopData.shop_phone
  //       },
  //       nextStep: 'verify_phone'
  //     }
  //   } catch (error) {
  //     if (error instanceof UnauthorizedError) {
  //       throw error
  //     }
  //     throw new BadRequestError('Verified email failed')
  //   }
  // }

  // // ✅ STEP 3: Verify phone and create shop
  // async verifyPhoneAndCreateShop(sessionId: string, phoneOTP: string, userId: string) {
  //   try {
  //     // 1. Get pending registration
  //     const pending = this.pendingRegistrations.get(sessionId)
  //     console.log('pending phone', pending)
  //     if (!pending || pending.userId !== userId) {
  //       throw new BadRequestError('Invalid or expired verification session')
  //     }

  //     // 2. Check if we're in the right step
  //     if (pending.currentStep !== 'phone_verification') {
  //       throw new BadRequestError('Invalid verification step')
  //     }

  //     // 3. Ensure email is verified
  //     if (!pending.emailOTP.verified) {
  //       throw new BadRequestError('Email must be verified first')
  //     }

  //     // 4. Verify phone OTP
  //     const phoneValid = await OTPServices.verifyOTP(phoneOTP, pending.phoneOTP.code)
  //     if (!phoneValid) {
  //       pending.phoneOTP.attempts++
  //       this.pendingRegistrations.set(sessionId, pending)
  //       throw new BadRequestError(`Invalid phone OTP. ${5 - pending.phoneOTP.attempts} attempts remaining.`)
  //     }

  //     // 5. Both verified - Create shop
  //     const newShop = await this.createVerifiedShop(pending)

  //     console.log('newShop', newShop)

  //     // 6. Clean up
  //     this.pendingRegistrations.delete(sessionId)

  //     // 7. Send welcome email
  //     // await EmailServices.sendShopWelcomeEmail(pending.shopData.shop_email, newShop)

  //     return {
  //       shop: {
  //         id: newShop._id,
  //         shop_name: newShop.shop_name,
  //         shop_slug: newShop.shop_slug,
  //         owner_full_name: newShop.owner_info.full_name,
  //         status: newShop.status
  //       },
  //       user: {
  //         id: userId,
  //         newRole: 'seller'
  //       },
  //       message: 'Shop created successfully! You can now start creating products.',
  //       nextSteps: [
  //         'Upload shop logo and banner',
  //         'Create your first product',
  //         'Set up shop policies',
  //         'Complete business verification for higher limits'
  //       ]
  //     }
  //   } catch (error) {
  //     if (error instanceof UnauthorizedError) {
  //       throw error
  //     }
  //     throw new BadRequestError('Verified phone number failed')
  //   }
  // }

  // // ✅ Helper: Create verified shop in database
  // private async createVerifiedShop(pending: IPendingShopRegistration) {
  //   const now = new Date()

  //   const shopData = {
  //     user_id: convertStringToObjectId(pending.userId),
  //     shop_name: pending.shopData.shop_name,
  //     shop_slug: pending.shopData.shop_name,
  //     shop_description: pending.shopData.shop_description,
  //     // shop_logo?: string
  //     // shop_banner?: string
  //     business_type: pending.shopData.business_type,
  //     owner_info: {
  //       full_name: pending.shopData.owner_info.full_name,
  //       avatar: pending.shopData.owner_info.avatar
  //     },
  //     tax_id: pending.shopData.tax_id,
  //     address: pending.shopData.address,
  //     shop_phone: pending.shopData.shop_phone,
  //     shop_email: pending.shopData.shop_email,

  //     shop_email_verified: true,
  //     shop_phone_verified: true,
  //     is_verified: true,
  //     verified_at: now,
  //     status: 'active' as const,
  //     createdAt: now
  //   }

  //   return await this.shopRepository.createShop(shopData)
  // }

  // register seller
  // registerShop = async (userId: string, shopBody: shopRegistrationZodType) => {
  //   try {
  //     // check if user exits
  //     const user = await this.userRepository.getUserById(userId)
  //     console.log('user', user)
  //     if (!user) {
  //       throw new NotFoundError('User not found')
  //     }

  //     // check role
  //     if (user.role == 'seller' || user.role == 'admin') {
  //       throw new ConflictError('User is ready a seller')
  //     }

  //     // Check shopName is exists
  //     const isShopNameExists = await this.shopRepository.findShopByName(shopBody.shop_name)
  //     if (isShopNameExists) {
  //       throw new ConflictError('Shop name already exists')
  //     }

  //     // Genera OTP
  //     const _MINUTES = 5 * 60 * 1000 // 5 munites
  //     const otp = OTPServices.generateOTP()
  //     const hashOTP = await OTPServices.hashOTP(otp)
  //     const otpExp = new Date(Date.now() + _MINUTES)

  //     // Send OTP SMS: 7VY9P4R267FB9CJU1R1UZTFV

  //     // Create shop
  //     const shopData = {
  //       user_id: convertStringToObjectId(userId),
  //       shop_name: shopBody.shop_name,
  //       shop_slug: shopBody.shop_name,
  //       shop_description: shopBody.shop_description,
  //       shop_logo: shopBody.shop_logo,
  //       business_type: shopBody.business_type,
  //       tax_id: shopBody.tax_id,
  //       phone: shopBody.phone,
  //       address: shopBody.address,
  //       shop_ratings: 0,
  //       total_products: 0,
  //       total_sales: 0,
  //       is_verified: false,
  //       status: 'active' as const
  //     }

  //     const newShop = await this.shopRepository.createShop(shopData)

  //     return {
  //       shop: {
  //         id: newShop._id,
  //         shop_name: newShop.shop_name,
  //         shop_slug: newShop.shop_slug,
  //         shop_description: newShop.shop_description,
  //         is_verified: newShop.is_verified,
  //         status: newShop.status
  //       },
  //       user: {
  //         id: userId,
  //         role: 'seller'
  //       }
  //     }
  //   } catch (error) {
  //     throw new BadRequestError('Register shop failed')
  //   }
  // }

  // ✅ Utility helpers
  private generateSessionId(userId: string): string {
    return `shop_${userId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  // validate and format phonenumber
  private validateAndFormatPhone(phone: string): string {
    console.log('🔍 Input phone:', phone)

    // Remove all non-digit characters except +
    let cleaned = phone.replace(/[^\d+]/g, '')
    console.log('🧹 Cleaned phone:', cleaned)

    // Handle Vietnamese numbers
    if (cleaned.startsWith('0')) {
      // Convert 0703288627 -> +84703288627
      cleaned = '+84' + cleaned.substring(1)
    } else if (cleaned.startsWith('84') && !cleaned.startsWith('+84')) {
      // Convert 84703288627 -> +84703288627
      cleaned = '+' + cleaned
    } else if (!cleaned.startsWith('+')) {
      // Add +84 prefix if missing
      cleaned = '+84' + cleaned
    }

    console.log('✅ Final formatted phone:', cleaned)

    // Validate with libphonenumber-js
    if (!isValidPhoneNumber(cleaned, 'VN')) {
      throw new BadRequestError(`Invalid Vietnam phone number: ${phone}. Expected format: 0703288627 or +84703288627`)
    }

    const phoneNumber = parsePhoneNumber(cleaned, 'VN')
    const result = phoneNumber.format('E.164') // +84703288627

    console.log('📱 E.164 format:', result)
    return result
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }
}
