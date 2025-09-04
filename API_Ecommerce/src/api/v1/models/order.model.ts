import type { IOrder } from "~/api/v1/types/order.type";
import { Schema } from "mongoose";

export const orderSchema = new Schema<IOrder>({
  order_userId: {
    type: String,
    required: true
  },
  order_shipping: {
    type: Object,
    default: {}
  },
  order_payment: {
    type: Object,
    default: {}
  },
  order_products: {
    type: [],
    required: true
  },
  order_trackingNumber: {
    type: Number
  },
  order_status: {
    type: String,
    enum: ['pending', 'confirm', 'shipped', 'cancelled'],
    default: 'pending'
  },
  order_checkout: {
    type: Object,
    default: {}
  }
}, {
  timestamps: true
})

