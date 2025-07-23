import { ShopRepository } from '~/api/v1/repositories/shop.repository'
import { UserRepository } from '~/api/v1/repositories/user.repository'
import { FirebaseSerivices } from '~/api/v1/services/firebase.service'
import { convertStringToObjectId } from '~/api/v1/utils/common.util'

import { OTPServices } from '~/api/v1/utils/otp.util'
import {
  BadRequestError,
  ConflictError,
  NotFoundError,
  UnauthorizedError,
  ValidationError
} from '~/api/v1/utils/response.util'
import { shopRegistrationZodType, verifyEmailZodType, verifyPhoneZodType } from '~/api/v1/validations/shop.validation'
import { IPendingShopRegistration } from '~/api/v1/types/shop.type'
import { EmailServices } from '~/api/v1/services/email.service'

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
    const shop_phone = this.normalizePhone(shopData.shop_phone)
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
        shop_phone
      },
      currentStep: 'email_verification',
      shop_email_OTP: {
        createAt: new Date(),
        hashOTP: hashEmailOTP,
        expired: new Date(Date.now() + 5 * 60 * 1000),
        verify: false,
        attempts: 0
      },
      shop_phone_OTP: {
        createAt: undefined,
        hashOTP: '',
        expired: undefined,
        verify: false,
        attempts: 0
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
      message: 'Email verification code sent to your business email'
    }
  }

  verifyEmailShop = async (body: verifyEmailZodType, userId: string) => {
    const checkSessionId = this.pendingRegistrations.has(body.sessionId)
    if (!checkSessionId) {
      throw new BadRequestError('SessionId is not exists ')
    }
    const pendingData = this.pendingRegistrations.get(body.sessionId)
    if (!pendingData || pendingData.userId !== userId) {
      throw new BadRequestError('Invalid or expired verification session')
    }

    if (new Date() > pendingData.shop_email_OTP.expired!) {
      throw new BadRequestError('Email OTP has expired')
    }

    // ✅ KIỂM TRA ĐÃ VERIFY CHƯA
    if (pendingData.shop_email_OTP.verify) {
      throw new BadRequestError('Email already verified')
    }

    // ✅ KIỂM TRA SỐ LẦN THỬ
    if (pendingData.shop_email_OTP.attempts! >= 5) {
      throw new BadRequestError('Too many failed attempts. Please restart registration.')
    }

    const verifyOTPEmail = await OTPServices.verifyOTP(body.emailOTP, pendingData.shop_email_OTP.hashOTP)
    if (!verifyOTPEmail) {
      pendingData.shop_email_OTP.attempts! += 1
      this.pendingRegistrations.set(body.sessionId, pendingData)
      throw new BadRequestError(`Invalid email OTP. ${5 - pendingData.shop_email_OTP.attempts!} attempts remaining.`)
    }

    pendingData.shop_email_OTP.verify = true
    pendingData.currentStep = 'phone_verification'

    // create sessionID
    this.pendingRegistrations.set(body.sessionId, pendingData)
    return {
      sessionId: body.sessionId,
      currentStep: 'phone_verification',
      message: 'Email verified! Now verify your phone number with Firebase.',
      phoneNumber: pendingData.shopData.shop_phone
    }
  }

  verifyPhoneNumberShop = async (body: verifyPhoneZodType, userId: string) => {
    const pendingData = this.pendingRegistrations.get(body.sessionId)!
    const shop_phone = pendingData.shopData.shop_phone
    if (!pendingData || pendingData.userId !== userId) {
      throw new BadRequestError('Invalid or expired verification session')
    }

    if (pendingData.currentStep !== 'phone_verification') {
      throw new BadRequestError('Invalid verification step')
    }

    if (!pendingData.shop_email_OTP.verify) {
      throw new BadRequestError('Email must be verified first')
    }

    // check user exists
    const user = this.userRepository.getUserById(userId)
    if (!user) {
      throw new NotFoundError('User not found')
    }

    console.log('firebaseIdToken', body.firebaseIdToken)

    const firebaseResult = await FirebaseSerivices.verifyPhoneTokenId(body.firebaseIdToken, shop_phone)
    if (!firebaseResult.isValid) {
      throw new UnauthorizedError('Phone verification failed')
    }

    // Mark phone verified
    pendingData.shop_phone_OTP.verify = true
    pendingData.currentStep = 'completed'
    this.pendingRegistrations.set(body.sessionId, pendingData)

    // ✅ BOTH VERIFIED → CREATE SHOP
    const newShop = await this.createVerifiedShop(pendingData)

    // Cleanup
    this.pendingRegistrations.delete(body.sessionId)
    return {
      shop: {
        id: newShop._id,
        shop_name: newShop.shop_name,
        shop_slug: newShop.shop_slug,
        status: newShop.status
      },
      message: 'Shop created successfully! Both email and phone verified.'
    }
  }

  // ✅ Utility helpers
  private generateSessionId(userId: string): string {
    return `shop_${userId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }
  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
  }
  // ✅ Helper: Create shop khi cả 2 đều verified
  private async createVerifiedShop(pending: IPendingShopRegistration) {
    const shopData = {
      user_id: convertStringToObjectId(pending.userId),
      shop_name: pending.shopData.shop_name,
      shop_slug: this.generateSlug(pending.shopData.shop_name),
      shop_description: pending.shopData.shop_description,
      business_type: pending.shopData.business_type,
      owner_info: pending.shopData.owner_info,
      tax_id: pending.shopData.tax_id,
      address: pending.shopData.address,
      shop_phone: pending.shopData.shop_phone,
      shop_email: pending.shopData.shop_email,
      is_verify_email: true,
      is_verify_phone: true,
      is_verified: true,
      verified_at: new Date(),
      status: 'active' as const
    }

    return await this.shopRepository.createShop(shopData)
  }

  /**
   * validate and format phonenumber
   *  ✅ Normalize phone number (0703288627 -> +84703288627)
   */
  private normalizePhone(phone: string): string {
    const cleaned = phone.replace(/[^\d+]/g, '')

    if (cleaned.startsWith('0')) {
      return '+84' + cleaned.substring(1)
    } else if (cleaned.startsWith('84') && !cleaned.startsWith('+84')) {
      return '+' + cleaned
    } else if (!cleaned.startsWith('+')) {
      return '+84' + cleaned
    }

    return cleaned
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }
}
