import mongoose from "mongoose";
import { BaseRepository } from "~/api/v1/repositories/base.repository";
import { IOrder } from "~/api/v1/types/order.type";
import { orderSchema } from "~/api/v1/models/order.model";

export class OrderRepository extends BaseRepository {
  private model = new Map<string, mongoose.Model<IOrder>>()

  async getOrderModel() {
    const dbName = this.dbName
    if (!this.model.has(dbName)) {
      const connection = await this.getConnection()
      const OrderMoldel = await connection.model('Order', orderSchema)
      return OrderMoldel
    }
    return this.model.get(dbName)!
  }

  async createNewOrder(body: {
    order_userId: string
    order_checkout: {
      totalPrice: number
      totalApllyDiscount: number
      feeship: number
    }
    order_shipping: {
      street?: string
      city: string
      state: string
      country: string
    }
  }) {
  }
}