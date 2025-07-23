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

  async findShopByUserId(userId: string): Promise<IShop | null> {
    const ShopModel = await this.getShopModel()
    return await ShopModel.findOne({
      user_id: userId
    }).lean()
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

  // update email verify
  async updateEmailShopVerify(
    userId: string,
    data: {
      shop_email: string
      is_verify_email: boolean
    }
  ) {
    const ShopModel = this.getShopModel()
    return (await ShopModel).updateOne(
      {
        user_id: userId
      },
      {
        shop_email: data.shop_email,
        is_verify_email: data.is_verify_email
      }
    )
  }

  // update email verify
  async updatePhoneShopVerify(
    userId: string,
    data: {
      shop_phone: string
      is_verify_phone: boolean
    }
  ) {
    const ShopModel = this.getShopModel()
    return (await ShopModel).updateOne(
      {
        user_id: userId
      },
      {
        shop_phone: data.shop_phone,
        is_verify_phone: data.is_verify_phone
      }
    )
  }
}
