import mongoose, { Types } from "mongoose";
import { InventotySchema } from "~/api/v1/models/inventory.model";
import { BaseRepository } from "~/api/v1/repositories/base.repository";
import { IInventory } from "~/api/v1/types/inventory.type";

export class InventoryRepository extends BaseRepository {
  private models = new Map<string, mongoose.Model<IInventory>>
  async getInventoryModel() {
    const dbName = this.dbName
    if (!this.models.has(dbName)) {
      const connection = await this.getConnection()
      const inventoryModel = connection.model<IInventory>('Inventory', InventotySchema)
      this.models.set(dbName, inventoryModel)
    }
    return this.models.get(dbName)!
  }

  // create inventory
  async createInventory(body: {
    productId: Types.ObjectId,
    shopId: Types.ObjectId,
    stock: number
  }) {
    const InventoryModel = await this.getInventoryModel()
    const result = await InventoryModel.create({
      product_id: body.productId,
      inven_stock: body.stock,
      shop_id: body.shopId
    })
    return result
  }
}
