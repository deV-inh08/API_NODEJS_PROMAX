import { Schema } from 'mongoose'
import { ICartItem, ICartProducts, ICartVariant } from '~/api/v1/types/cart.type'

const cartVariantSchema = new Schema<ICartVariant>(
  {
    color: {
      type: String,
      required: true
    },
    size: {
      type: String,
      required: true
    },
    style: {
      type: String,
      required: false
    }
  },
  {
    _id: false
  }
)

const cartProductsSchema = new Schema<ICartProducts>(
  {
    product_id: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    shop_id: {
      type: Schema.Types.ObjectId,
      ref: 'shops',
      required: true
    },
    product_name: {
      type: String,
      trim: true,
      required: true
    },
    product_price: {
      type: Number,
      required: true,
      default: 0
    },
    product_quantity: {
      type: Number,
      required: true,
      min: 1,
      default: 0
    },
    product_stock: {
      type: Number,
      required: true,
      min: 0
    },
    product_variant: {
      type: cartVariantSchema,
      default: undefined
    }
  },
  {
    _id: false
  }
)

export const cartSchema = new Schema<ICartItem>(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: 'users',
      require: true,
      unique: true
    },
    cart_state: {
      type: String,
      enum: ['active', 'pending', 'failed'],
      default: 'active',
      lowercase: true
    },
    cart_count_products: {
      type: Number,
      default: 0
    },
    cart_total_item: {
      type: Number,
      default: 0
    },
    cart_products: {
      type: [cartProductsSchema],
      default: []
    }
  },
  {
    collection: 'Cart',
    timestamps: true
  }
)
