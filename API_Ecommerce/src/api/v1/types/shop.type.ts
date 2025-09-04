import { Types } from 'mongoose'
import { Status } from '~/api/v1/types/comon.types'
import { shopRegistrationZodType } from '~/api/v1/validations/shop.validation'

export interface IShop {
  _id: Types.ObjectId
  user_id: Types.ObjectId
  shop_name: string
  shop_phone: string
  shop_email: string
  shop_slug?: string
  shop_description?: string
  shop_logo?: string
  shop_banner?: string
  business_type: 'individual' | 'company'
  owner_info: {
    full_name: string
    avatar?: string
  }
  tax_id?: string
  address: {
    street?: string
    city: string
    state?: string
    country: string
    postal_code?: string
  }
  shop_ratings?: number
  total_products?: number
  total_sales?: number
  is_verify_phone: boolean
  is_verify_email: boolean
  is_verified: boolean
  verified_at?: Date
  status: Status
  createdAt: Date
  updatedAt?: Date
}

// ✅ PENDING SHOP REGISTRATION TYPE
export interface IPendingShopRegistration {
  userId: string
  shopData: Pick<IShop, keyof shopRegistrationZodType>
  shop_email_OTP: {
    hashOTP: string
    expired?: Date
    createAt?: Date
    verify: boolean
    attempts: number
  }
  shop_phone_OTP: {
    hashOTP: string
    expired?: Date
    createAt?: Date
    verify: boolean
    attempts: number
  }
  currentStep: 'email_verification' | 'phone_verification' | 'completed'
  createdAt: Date
  expiresAt: Date // 30 minutes session
}
