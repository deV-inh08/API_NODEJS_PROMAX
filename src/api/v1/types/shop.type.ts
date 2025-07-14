import { Types } from 'mongoose'
import { Status } from '~/api/v1/types/comon.types'

export interface IShop {
  _id: Types.ObjectId
  user_id: Types.ObjectId
  shop_name: string
  shop_slug: string
  shop_description?: string
  shop_logo?: string
  shop_banner?: string
  business_type: 'individual' | 'company'
  tax_id?: string
  phone: string
  address: {
    street?: string
    city: string
    state?: string
    country: string
    postal_code?: string
  }
  shop_ratings: number
  total_products: number
  total_sales: number
  is_verified: boolean
  verified_at?: Date
  status: Status
  createdAt: Date
  updatedAt: Date
}
