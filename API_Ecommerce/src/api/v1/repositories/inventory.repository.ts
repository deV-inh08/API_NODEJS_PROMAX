import mongoose, { Types } from 'mongoose'
import { InventotySchema } from '~/api/v1/models/inventory.model'
import { BaseRepository } from '~/api/v1/repositories/base.repository'
import { IInventory } from '~/api/v1/types/inventory.type'
import { convertStringToObjectId } from '~/api/v1/utils/common.util'

export class InventoryRepository extends BaseRepository {
  private models = new Map<string, mongoose.Model<IInventory>>()
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
  async createInventory(body: { productId: Types.ObjectId; shopId: Types.ObjectId; stock: number }) {
    const InventoryModel = await this.getInventoryModel()
    const result = await InventoryModel.create({
      product_id: body.productId,
      inven_stock: body.stock,
      shop_id: body.shopId
    })
    return result
  }

  // get stock by {product_id, shop_id}
  async getInventory(body: { shopId: string; productId: string }) {
    const InventoryModel = await this.getInventoryModel()
    return await InventoryModel.findOne({
      product_id: body.productId,
      shop_id: body.shopId
    }).lean()
  }

  async revervationInventory(productId: string, quantity: number, cartId: string) {
    const InventoryModel = await this.getInventoryModel()

    const query = {
      product_id: convertStringToObjectId(productId),
      inven_stock: {
        $gte: quantity
      }
    }

    const updateSet = {
      $inc: {
        inven_stock: -quantity
      },
      $push: {
        inven_revervations: {
          quantity,
          cartId,
          createAt: new Date()
        }
      }
    }

    return await InventoryModel.updateOne(query, updateSet)
  }
}
