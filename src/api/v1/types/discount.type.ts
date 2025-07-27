import { Types } from 'mongoose'

export interface IDiscount {
  _id?: Types.ObjectId
  shop_id: Types.ObjectId
  discount_name: string
  discount_desc: string
  discount_type: string
  discount_value: number
  discount_code: string
  discount_start_date: Date
  discount_end_date: Date
  discount_max_uses: number // so luong discount duoc ap dung
  discount_uses_count: number // moi user duoc su dung bao nhieu lan
  discount_users_used: string[] // user nao da su dung
  discount_max_uses_per_user: number // user nao da su dung
  discount_min_order_value: number // user nao da su dung
  discount_is_active: boolean
  discount_applies_to: string
  discount_product_ids: string[] // so sp duoc ap dung
}
