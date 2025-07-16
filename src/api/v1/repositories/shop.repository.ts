import { Model } from 'mongoose'
import { shopSchema } from '~/api/v1/models/shop.model'
import { BaseRepository } from '~/api/v1/repositories/base.repository'
import { IShop } from '~/api/v1/types/shop.type'

export class ShopRepository extends BaseRepository {
  private models = new Map<string, Model<IShop>>()

  private async getShopModel() {
    const dbName = this.dbName
    if (!this.models.has(dbName)) {
      const connection = await this.getConnection()
      const shopModel = connection.model<IShop>('Shop', shopSchema)
      this.models.set(dbName, shopModel)
    }
    return this.models.get(dbName)!
  }

  // Create Shop
  async createShop(shopData: Partial<IShop>) {
    const shopModel = await this.getShopModel()
    const [shop] = await shopModel.create([shopData])
    return shop
  }

  // Find shop name
  async findShopByName(shopName: string): Promise<IShop | null> {
    const ShopModel = await this.getShopModel()
    return await ShopModel.findOne({
      shop_name: shopName
    }).lean()
  }

  // find shop by Id
  async findShopById(shopId: string): Promise<IShop | null> {
    const ShopModel = await this.getShopModel()
    return await ShopModel.findById(shopId).lean()
  }

  // update shop verify status
  async updateShopVerification(
    shopId: string,
    verification: {
      shop_email_verified?: boolean
      shop_phone_verified?: boolean
    }
  ) {
    const ShopModel = await this.getShopModel()
    return ShopModel.findByIdAndUpdate(
      shopId,
      {
        ...verification,
        is_verified: true,
        verified_at: new Date()
      },
      {
        new: true
      }
    ).lean()
  }
}
