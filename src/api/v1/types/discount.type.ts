import { Types } from 'mongoose'

export enum DiscountAppliesTo {
  ALL = 'all',
  SPECIFIC = 'specific'
}

export interface IDiscount {
  _id?: Types.ObjectId
  shop_id: Types.ObjectId
  discount_name: string
  discount_description: string
  discount_type: string
  discount_value: number
  discount_code: string
  discount_start_date: Date
  discount_end_date: Date
  discount_max_uses: number
  discount_uses_count?: number
  discount_users_used?: Types.ObjectId[]
  discount_max_uses_per_user: number
  discount_min_order_value: number
  discount_is_active: boolean
  discount_applies_to: DiscountAppliesTo
  discount_product_ids: Types.ObjectId[]
}
