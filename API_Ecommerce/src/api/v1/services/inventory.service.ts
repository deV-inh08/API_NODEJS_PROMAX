import { ProductRepository } from "~/api/v1/repositories/product.repository"
import { NotFoundError } from "~/api/v1/utils/response.util"
import { InventoryRepository } from "~/api/v1/repositories/inventory.repository"

export class InventoryServices {
  private productRepository: ProductRepository
  private inventoryRepository: InventoryRepository
  constructor() {
    this.productRepository = new ProductRepository()
    this.inventoryRepository = new InventoryRepository()
  }
  async addStockToInventory(body: { stock: number; productId: string; shopId: string; location: string }) {
    const { productId, shopId, stock, location } = body
    const product = this.productRepository.getProductById(productId)
    if (!product) throw new NotFoundError('Cannot not found product')

    const query = {
      shop_id: shopId,
      product_id: productId
    }

    const updateSet = {
      $inc: {
        inven_stock: stock
      },
      $set: {
        inven_location: location
      }
    }

    const options = {
      upsert: true,
      new: true
    }
    const InvenToryModel = await this.inventoryRepository.getInventoryModel()
    return InvenToryModel.findOneAndUpdate(query, updateSet, options)
  }
}
