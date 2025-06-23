import mongoose from 'mongoose'

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

export interface IAddToCart {
  productId: string
  quantity: number
  variant: ICartVariant
}

export interface IUpdateToCart {
  productId: string
  quantity: number
  variant: ICartVariant
}
