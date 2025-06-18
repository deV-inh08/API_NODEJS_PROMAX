import mongoose from "mongoose"

export interface ICartVariant {
  size?: string
  color?: string
  style?: string
}

export interface ICartItem {
  productId: mongoose.Types.ObjectId
  quantity: number
  variant: ICartVariant
  addAt: Date
}

export interface AddToCart {
  productId: string
  quantity: number
  variant: ICartVariant
}

export interface UpdateToCart {
  productId: string
  quantity: number
  variant: ICartVariant
}
