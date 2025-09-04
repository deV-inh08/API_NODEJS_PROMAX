import { Schema, Types } from 'mongoose'

/**
 * ORDER-001: Order successfully
 * ORDER-002: Order failed
 * PROMOTION-001: new Promotion
 * SHOP-001: new product by User following
 */

export const notificationSchema = new Schema(
  {
    noti_type: {
      type: String,
      enum: ['ORDER-001', 'ORDER-002', 'PROMOTION-001', 'SHOP-001']
    },
    shop_id: {
      type: Types.ObjectId,
      ref: 'shops'
    },
    user_id: {
      type: Types.ObjectId,
      ref: 'users'
    },
    noti_content: {
      type: String,
      require: true
    },
    noti_options: {
      type: Object,
      default: {}
    }
  },
  {
    timestamps: true,
    collection: 'Notification'
  }
)
