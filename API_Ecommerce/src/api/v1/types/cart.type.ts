import mongoose, { Types } from 'mongoose'

export interface ICartVariant {
  size: string
  color: string
  style?: string
}

export interface ICartProducts {
  product_id: Types.ObjectId
  shop_id: Types.ObjectId
  product_name: string
  product_price: number
  product_quantity: number
  product_stock: number
  product_variant: ICartVariant
}

export interface ICartItem extends Document {
  user_id: mongoose.Types.ObjectId
  cart_state: 'active' | 'pending' | 'failed'
  cart_count_products: number
  cart_total_item: number
  cart_products: ICartProducts[]
}
