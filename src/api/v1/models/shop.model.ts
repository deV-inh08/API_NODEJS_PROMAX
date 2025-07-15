import { Schema } from 'mongoose'
import { IShop } from '~/api/v1/types/shop.type'

export const shopSchema = new Schema<IShop>(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true
    },
    shop_name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      maxlength: 100
    },
    shop_slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true
    },
    shop_description: {
      type: String,
      maxlength: 500
    },
    shop_logo: {
      type: String,
      default: null
    },
    shop_banner: {
      type: String,
      default: null
    },
    business_type: {
      type: String,
      enum: ['individual', 'company'],
      default: 'individual'
    },
    owner_info: {
      full_name: {
        type: String,
        required: true,
        trim: true
      },
      avatar: {
        type: String // URL to uploaded avatar
      }
    },
    tax_id: {
      type: String,
      sparse: true
    },
    shop_phone: {
      type: String,
      required: true
    },
    shop_email: {
      type: String,
      required: true
    },
    address: {
      street: String,
      city: String,
      state: String,
      country: String,
      postal_code: String
    },
    shop_ratings: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    total_products: {
      type: Number,
      default: 0
    },
    total_sales: {
      type: Number,
      default: 0
    },
    shop_email_verified: {
      type: Boolean,
      default: false,
      // Mục đích: Xác minh email shop để nhận orders, customer communications
    },
    shop_phone_verified: {
      type: Boolean,
      default: false,
      // Mục đích: Xác minh phone shop để shipper/customer liên hệ
    },
    is_verified: {
      type: Boolean,
      default: false
    },
    verified_at: {
      type: Date,
      default: null
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'suspended'],
      default: 'active'
    }
  },
  {
    timestamps: true
  }
)
