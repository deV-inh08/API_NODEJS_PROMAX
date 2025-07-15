import { Types } from 'mongoose'
import { Status } from '~/api/v1/types/comon.types'

export interface IShop {
  _id: Types.ObjectId
  user_id: Types.ObjectId
  shop_name: string
  shop_slug?: string
  shop_description?: string
  shop_logo?: string
  shop_banner?: string
  business_type: 'individual' | 'company'
  owner_info: {
    full_name: string,
    avatar?: string
  }
  tax_id?: string
  shop_phone: string
  shop_email: string
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
  shop_email_verified: boolean
  shop_phone_verified: boolean
  is_verified: boolean
  verified_at?: Date
  status: Status
  createdAt: Date
  updatedAt?: Date
}


// ✅ PENDING SHOP REGISTRATION TYPE
export interface IPendingShopRegistration {
  userId: string
  shopData: {
    shop_name: string
    shop_description?: string
    owner_info: {
      full_name: string,
      avatar?: string
    }
    shop_email: string
    shop_phone: string
    alternative_phone?: string
    business_type: 'individual' | 'company'
    tax_id?: string
    address: {
      street?: string
      city: string
      state?: string
      country: string
      postal_code?: string
    }
  }

  // OTP verification
  emailOTP: {
    code: string // hashed
    expiresAt: Date
    verified: boolean
    attempts: number
  }

  phoneOTP: {
    code: string // hashed
    expiresAt: Date
    verified: boolean
    attempts: number
  }
  currentStep: string
  createdAt: Date
  expiresAt: Date // 30 minutes session
}