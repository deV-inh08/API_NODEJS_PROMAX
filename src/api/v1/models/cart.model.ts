import { Schema } from 'mongoose'
import { ICartItem } from '~/api/v1/types/cart.type'

export const cartSchema = new Schema<ICartItem>({
  productId: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: [true, 'Product ID là bắt buộc']
  },
  quantity: {
    type: Number,
    default: 1,
    required: [true, 'Số lượng là bắt buộc'],
    min: [1, 'Số lượng  sản phẩm trong giỏ hàng phải lớn hơn 0']
  },
  variant: {
    size: {
      type: String,
      trim: true
    },
    color: {
      type: String,
      trim: true
    },
    style: {
      type: String,
      trim: true
    }
  },
  addAt: {
    type: Date,
    default: Date.now
  }
})
