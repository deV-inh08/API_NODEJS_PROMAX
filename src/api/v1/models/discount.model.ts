import { Schema } from 'mongoose'
import { IDiscount } from '~/api/v1/types/discount.type'

export const discountSchema = new Schema<IDiscount>({
  shop_id: {
    type: Schema.Types.ObjectId,
    ref: 'shops',
    required: true,
    unique: true
  },
  discount_name: {
    type: String,
    required: [true, 'discount_name is required']
  },
  discount_description: {
    type: String,
    required: [true, 'discount_desc is required']
  },
  discount_type: {
    type: String,
    required: true,
    default: 'fixed_amount'
  },
  discount_value: {
    type: Number,
    required: [true, 'discount_value is required']
  },
  discount_code: {
    type: String,
    required: [true, 'discount_code is required']
  },
  discount_start_date: {
    type: Date,
    required: [true, 'discount_start_date is required']
  },
  discount_end_date: {
    type: Date,
    required: [true, 'discount_end_date is required']
  },
  discount_max_uses: {
    type: Number,
    required: [true, 'discount_max_uses is required']
  },
  discount_uses_count: {
    type: Number,
    required: [true, 'discount_uses_count is required'],
    default: 0
  },
  discount_users_used: {
    type: [String],
    default: []
  },
  discount_max_uses_per_user: {
    type: Number,
    required: [true, 'discount_max_uses_per_user is required']
  },
  discount_min_order_value: {
    type: Number,
    required: [true, 'discount_min_order_value is required']
  },
  discount_is_active: {
    type: Boolean,
    default: true
  },
  discount_applies_to: {
    type: String,
    required: true,
    enum: ['all', 'specific']
  },
  discount_product_ids: {
    type: [String],
    default: []
  }
}, {
  timestamps: true,
  collection: 'discounts'
})
