import { Types } from 'mongoose'
export interface IInventory {
  _id?: Types.ObjectId
  product_id: Types.ObjectId
  shop_id: Types.ObjectId
  inven_stock: number
  inven_reservations: string[]
  createdAt?: Date
  updatedAt?: Date
}
